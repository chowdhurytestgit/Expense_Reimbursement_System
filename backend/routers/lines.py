from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from database import get_db
from models import ExpenseReport, ExpenseLine, StatusEnum, User
from auth import get_current_user
from schemas import ExpenseLineCreate
import uuid

router = APIRouter(prefix="/reports", tags=["lines"])

def generate_uuid():
    return str(uuid.uuid4())

def recalculate_report_total(db: Session, report: ExpenseReport):
    # Goal 3: Total is ALWAYS calculated by the server
    total = db.query(func.sum(ExpenseLine.amount)).filter(ExpenseLine.report_id == report.id).scalar()
    report.total_amount = total or 0.00
    db.commit()

@router.post("/{report_id}/lines")
def add_expense_line(report_id: str, line_in: ExpenseLineCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    report = db.query(ExpenseReport).filter(ExpenseReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    if report.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only owner can modify lines")
        
    if report.status not in [StatusEnum.DRAFT, StatusEnum.REJECTED]:
        raise HTTPException(status_code=400, detail="Can only edit lines when Draft or Rejected")

    new_line = ExpenseLine(
        id=generate_uuid(),
        report_id=report.id,
        date=line_in.date,
        amount=line_in.amount,
        category=line_in.category,
        description=line_in.description
    )
    db.add(new_line)
    db.commit()
    
    recalculate_report_total(db, report)
    return {"message": "Line added", "new_total": report.total_amount}