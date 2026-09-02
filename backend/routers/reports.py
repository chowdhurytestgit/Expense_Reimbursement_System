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

# ---> THIS IS THE MISSING ENDPOINT THAT FIXES THE 404 ERROR <---
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