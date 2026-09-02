from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from models import ExpenseReport, User, RoleEnum
from auth import get_current_user

router = APIRouter(prefix="/reports", tags=["search"])

@router.get("/")
def get_reports(
    search: Optional[str] = None,
    status: Optional[str] = None,
    sort_by: str = Query("created_at", regex="^(created_at|total_amount|status)$"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(ExpenseReport)

    # Goal 1: See only own reports unless Approver[cite: 2]
    if current_user.role != RoleEnum.APPROVER:
        query = query.filter(ExpenseReport.owner_id == current_user.id)

    # Filtering[cite: 2]
    if search:
        query = query.filter(ExpenseReport.title.ilike(f"%{search}%"))
    if status:
        query = query.filter(ExpenseReport.status == status)

    # Sorting[cite: 2]
    if sort_by == "total_amount":
        query = query.order_by(ExpenseReport.total_amount.desc())
    elif sort_by == "status":
        query = query.order_by(ExpenseReport.status.asc())
    else:
        query = query.order_by(ExpenseReport.created_at.desc())

    # Pagination[cite: 2]
    total_count = query.count()
    reports = query.offset((page - 1) * limit).limit(limit).all()

    return {
        "total_matches": total_count,
        "page": page,
        "reports": reports
    }