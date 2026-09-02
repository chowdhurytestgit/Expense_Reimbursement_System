from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from datetime import datetime, timedelta
from database import get_db
from models import ExpenseReport, StatusEnum, User, RoleEnum
from auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/metrics")
def get_dashboard_metrics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Goal 8: Headline numbers[cite: 2]
    one_week_ago = datetime.utcnow() - timedelta(days=7)
    
    query = db.query(ExpenseReport)
    if current_user.role != RoleEnum.APPROVER:
        query = query.filter(ExpenseReport.owner_id == current_user.id)

    awaiting_approval = query.filter(ExpenseReport.status == StatusEnum.SUBMITTED).count()
    due_reimbursements = query.filter(ExpenseReport.status == StatusEnum.APPROVED).with_entities(func.sum(ExpenseReport.total_amount)).scalar() or 0
    
    # Needs a history join for exact "approved this week", simplified here for brevity
    approved_this_week = query.filter(ExpenseReport.status == StatusEnum.APPROVED, ExpenseReport.updated_at >= one_week_ago).count()
    paid_this_week = query.filter(ExpenseReport.status == StatusEnum.PAID, ExpenseReport.updated_at >= one_week_ago).count()

    return {
        "awaiting_approval": awaiting_approval,
        "total_due": float(due_reimbursements),
        "approved_this_week": approved_this_week,
        "paid_this_week": paid_this_week
    }

@router.get("/alerts")
def get_stale_alerts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Goal 10: Stale-approval alerts (e.g., > 5 days)[cite: 2]
    if current_user.role != RoleEnum.APPROVER:
        return {"alerts": []}

    STALE_THRESHOLD_DAYS = 5
    stale_date = datetime.utcnow() - timedelta(days=STALE_THRESHOLD_DAYS)

    # Simplified logic: In production, check an AlertDismissal table to see if it was 
    # dismissed and if the reappearance threshold (> X more days) has passed[cite: 2].
    stale_reports = db.query(ExpenseReport).filter(
        ExpenseReport.status == StatusEnum.SUBMITTED,
        ExpenseReport.submitted_at < stale_date
    ).all()

    return {"alerts_count": len(stale_reports), "alerts": stale_reports}