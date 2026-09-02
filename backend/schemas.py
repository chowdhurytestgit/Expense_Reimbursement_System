from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional, List
from models import RoleEnum, StatusEnum

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: RoleEnum = RoleEnum.EMPLOYEE

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: RoleEnum

    class Config:
        from_attributes = True

class ExpenseLineCreate(BaseModel):
    date: date
    amount: float
    category: str
    description: str

class ApproveRequest(BaseModel):
    comment: Optional[str] = None

class RejectRequest(BaseModel):
    reason: str

class BulkActionRequest(BaseModel):
    report_ids: List[str]
    action: str  # 'approve' or 'reject'
    reason: Optional[str] = None