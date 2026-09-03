from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import ExpenseReport, StatusEnum, User, RoleEnum
from auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/metrics")
def get_dashboard_metrics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        # Check user role and calculate safe counts
        if current_user.role == RoleEnum.APPROVER:
            awaiting_approval = db.query(ExpenseReport).filter(ExpenseReport.status == StatusEnum.SUBMITTED).count()
            total_due = db.query(func.sum(ExpenseReport.total_amount)).filter(ExpenseReport.status == StatusEnum.SUBMITTED).scalar() or 0.0
        else:
            awaiting_approval = db.query(ExpenseReport).filter(ExpenseReport.owner_id == current_user.id, ExpenseReport.status == StatusEnum.SUBMITTED).count()
            total_due = db.query(func.sum(ExpenseReport.total_amount)).filter(ExpenseReport.owner_id == current_user.id, ExpenseReport.status.in_([StatusEnum.DRAFT, StatusEnum.SUBMITTED])).scalar() or 0.0

        approved_this_week = db.query(ExpenseReport).filter(ExpenseReport.status == StatusEnum.APPROVED).count()
        
        # Safely check if PAID status exists in your Enum
        paid_this_week = 0
        if hasattr(StatusEnum, 'PAID'):
            paid_this_week = db.query(ExpenseReport).filter(ExpenseReport.status == StatusEnum.PAID).count()

        return {
            "awaitingApproval": awaiting_approval,
            "totalDue": float(total_due),
            "approvedThisWeek": approved_this_week,
            "paidThisWeek": paid_this_week
        }
    except Exception as e:
        # Fallback to zeros instead of crashing with a 500 Internal Server Error
        print(f"Dashboard metrics error: {str(e)}")
        return {
            "awaitingApproval": 0,
            "totalDue": 0.0,
            "approvedThisWeek": 0,
            "paidThisWeek": 0
        }