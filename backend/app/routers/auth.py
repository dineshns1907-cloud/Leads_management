from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.services.auth_service import auth_service
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED, summary="Register a new salesperson or manager")
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Registers a new user account with secure hashed password storage.
    """
    user = auth_service.register_user(db, user_in)
    return user

@router.post("/login", response_model=Token, summary="Authenticate and acquire JWT access token")
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticates a user via email and password, returning a signed JWT access token.
    """
    user = auth_service.authenticate_user(db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = auth_service.create_user_token(user)
    return Token(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/token", response_model=Token, summary="OAuth2 compatible token login (form-data)")
def token_login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Swagger/OAuth2 compatible endpoint supporting username (email) and password form-data.
    """
    user = auth_service.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = auth_service.create_user_token(user)
    return Token(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse, summary="Get current authenticated user profile")
def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns the currently authenticated user's profile and assigned role.
    """
    return current_user

@router.post("/logout", summary="Logout current session")
def logout(current_user: User = Depends(get_current_user)):
    """
    Confirms logout from the client session.
    """
    return {"message": "Successfully logged out from LeadIQ session."}
