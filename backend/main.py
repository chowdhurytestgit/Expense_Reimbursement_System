from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import uuid

# Import directly from routers since main.py is in the backend folder
from routers import dashboard, search, lines, reports
from database import engine, Base, get_db
from models import User
from auth import get_password_hash, verify_password, create_access_token
from schemas import UserCreate, UserResponse

# Automatically create database tables locally
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Expense Reimbursement API", version="1.0.0")

# Enable CORS for React frontend development and live Vercel deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Authentication routes
@app.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = get_password_hash(user_in.password)
    new_user = User(
        id=str(uuid.uuid4()),
        email=user_in.email,
        hashed_password=hashed_pw,
        name=user_in.name,
        role=user_in.role  # Captures the 'employee' or 'approver' role sent from the frontend radio buttons
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Optional: Include role in the token payload if your frontend checks it directly from token claims
    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}

# Include all the feature routers (dashboard, search, lines, reports)
app.include_router(dashboard.router)
app.include_router(search.router)
app.include_router(lines.router)
app.include_router(reports.router)

@app.get("/")
def health_check():
    return {"status": "healthy", "message": "Expense Reimbursement API is running successfully."}