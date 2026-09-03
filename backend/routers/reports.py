import csv
import io
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date
from typing import List
from pydantic import BaseModel

from database import get_db
from models import ExpenseReport, ReportHistory, StatusEnum, User, RoleEnum
from auth import get_current_user 
from schemas import BulkActionRequest, RejectRequest, ApproveRequest

router = APIRouter(prefix="/reports", tags=["reports"])

def generate_uuid():
    return str(uuid.uuid4())

def record_history(db: Session, report: ExpenseReport, actor: User, old_status: str, new_status: str, reason: str = None, comment: str = None):
    history_entry = ReportHistory(
        id=generate_uuid(),
        report_id=report.id,
        actor_id=actor.id,
        old_status=old_status,
        new_status=new_status,
        reason=reason,
        comment=comment
    )
    db.add(history_entry)

class ReportCreate(BaseModel):
    title: str
    start_date: date
    end_date: date

# 1. Create Report Endpoint
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_report(report_in: ReportCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_report = ExpenseReport(
        id=generate_uuid(),
        title=report_in.title,
        start_date=report_in.start_date,
        end_date=report_in.end_date,
        status=StatusEnum.DRAFT,
        owner_id=current_user.id,
        total_amount=0.0
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    return new_report

# 2. Submit Report Endpoint
@router.post("/{report_id}/submit")
def submit_report(report_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    report = db.query(ExpenseReport).filter(ExpenseReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    if report.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the report owner can submit it.")
        
    if report.status not in [StatusEnum.DRAFT, StatusEnum.REJECTED]:
        raise HTTPException(status_code=400, detail=f"Cannot submit from {report.status} state.")

    old_status = report.status
    report.status = StatusEnum.SUBMITTED
    report.submitted_at = datetime.utcnow()
    
    record_history(db, report, current_user, old_status, StatusEnum.SUBMITTED)
    db.commit()
    return {"message": "Report submitted successfully"}

# 3. Approve Report Endpoint
@router.post("/{report_id}/approve")
def approve_report(report_id: str, req: ApproveRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != RoleEnum.APPROVER:
        raise HTTPException(status_code=403, detail="Approver role required.")
        
    report = db.query(ExpenseReport).filter(ExpenseReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    if report.owner_id == current_user.id:
        raise HTTPException(status_code=403, detail="You cannot approve your own report.")
        
    if report.status != StatusEnum.SUBMITTED:
        raise HTTPException(status_code=400, detail="Only submitted reports can be approved.")

    old_status = report.status
    report.status = StatusEnum.APPROVED
    
    record_history(db, report, current_user, old_status, StatusEnum.APPROVED, comment=req.comment)
    db.commit()
    return {"message": "Report approved"}

# 4. Bulk Action Endpoint (for rejections, etc.)
@router.post("/bulk-action")
def bulk_action(req: BulkActionRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != RoleEnum.APPROVER:
        raise HTTPException(status_code=403, detail="Approver role required.")

    results = {"successful": [], "failed": []}
    
    for report_id in req.report_ids:
        report = db.query(ExpenseReport).filter(ExpenseReport.id == report_id).first()
        
        if not report:
            results["failed"].append({"id": report_id, "reason": "Not found"})
            continue
            
        if report.owner_id == current_user.id:
            results["failed"].append({
                "id": report.id, 
                "title": report.title, 
                "reason": "Approver is also the report's owner."
            })
            continue
            
        if report.status != StatusEnum.SUBMITTED:
            results["failed"].append({
                "id": report.id, 
                "title": report.title, 
                "reason": f"Report is {report.status}, not SUBMITTED."
            })
            continue

        try:
            old_status = report.status
            if req.action == 'approve':
                report.status = StatusEnum.APPROVED
                record_history(db, report, current_user, old_status, StatusEnum.APPROVED)
            elif req.action == 'reject':
                if not req.reason:
                    raise ValueError("Reason required for rejection")
                report.status = StatusEnum.REJECTED
                record_history(db, report, current_user, old_status, StatusEnum.REJECTED, reason=req.reason)
            
            db.commit()
            results["successful"].append({"id": report.id, "title": report.title})
        except Exception as e:
            db.rollback()
            results["failed"].append({"id": report.id, "title": report.title, "reason": str(e)})

    return results