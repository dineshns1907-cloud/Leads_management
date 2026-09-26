from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User, UserRole
from app.schemas.user import UserCreate
from app.core.security import get_password_hash, verify_password, create_access_token

class AuthService:
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email.lower().strip()).first()

    @staticmethod
    def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def register_user(db: Session, user_in: UserCreate) -> User:
        existing = AuthService.get_user_by_email(db, user_in.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email address already exists."
            )
        
        user = User(
            name=user_in.name,
            email=user_in.email.lower().strip(),
            password_hash=get_password_hash(user_in.password),
            role=user_in.role.value if hasattr(user_in.role, 'value') else str(user_in.role),
            phone=user_in.phone,
            is_active=user_in.is_active
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        user = AuthService.get_user_by_email(db, email)
        if not user or not user.is_active:
            return None
        if not verify_password(password, user.password_hash):
            return None
        return user

    @staticmethod
    def create_user_token(user: User) -> str:
        return create_access_token({
            "sub": user.id,
            "email": user.email,
            "role": user.role,
            "name": user.name
        })

auth_service = AuthService()
