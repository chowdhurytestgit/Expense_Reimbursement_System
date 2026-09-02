from sqlalchemy import Column, String, Boolean, ForeignKey, Numeric, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from database import Base

class RoleEnum(str, enum.Enum):
    EMPLOYEE = "EMPLOYEE"
    APPROVER = "APPROVER"

class StatusEnum(str, enum.Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    PAID = "PAID"

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    name = Column(String)
    role = Column(Enum(RoleEnum), default=RoleEnum.EMPLOYEE)

class ExpenseReport(Base):
    __tablename__ = "expense_reports"
    id = Column(String, primary_key=True, index=True)
    title = Column(String)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    status = Column(Enum(StatusEnum), default=StatusEnum.DRAFT)
    is_archived = Column(Boolean, default=False)
    owner_id = Column(String, ForeignKey("users.id"))
    total_amount = Column(Numeric(10, 2), default=0.00)
    submitted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    
    owner = relationship("User", backref="owned_reports")
    lines = relationship("ExpenseLine", back_populates="report", cascade="all, delete-orphan")
    history = relationship("ReportHistory", back_populates="report")

class ExpenseLine(Base):
    __tablename__ = "expense_lines"
    id = Column(String, primary_key=True, index=True)
    report_id = Column(String, ForeignKey("expense_reports.id"))
    date = Column(DateTime)
    amount = Column(Numeric(10, 2))
    category = Column(String)
    description = Column(String)
    
    report = relationship("ExpenseReport", back_populates="lines")

class ReportHistory(Base):
    __tablename__ = "report_history"
    id = Column(String, primary_key=True, index=True)
    report_id = Column(String, ForeignKey("expense_reports.id"))
    actor_id = Column(String, ForeignKey("users.id"))
    old_status = Column(String, nullable=True)
    new_status = Column(String)
    reason = Column(String, nullable=True)
    comment = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    
    report = relationship("ExpenseReport", back_populates="history")
    actor = relationship("User")