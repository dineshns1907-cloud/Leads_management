from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.core.security import get_current_user, require_roles

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/", response_model=List[UserResponse], summary="List all sales team members")
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    users = db.query(User).filter(User.is_active == True).all()
    return users

@router.get("/{user_id}", response_model=UserResponse, summary="Get user details by ID")
def get_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user

@router.put("/{user_id}", response_model=UserResponse, summary="Update user profile")
def update_user(
    user_id: str,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Only self or manager/admin can update
    if current_user.id != user_id and current_user.role not in ("MANAGER", "ADMIN"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot edit another user's profile")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    for field, val in user_in.model_dump(exclude_unset=True).items():
        if field == "role" and current_user.role not in ("MANAGER", "ADMIN"):
            continue
        setattr(user, field, val)

    db.commit()
    db.refresh(user)
    return user
