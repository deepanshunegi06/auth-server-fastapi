"""
Authentication API routes for user registration, login, and token management.

This module handles all public authentication endpoints including:
- User registration with email/password
- Login with account lockout protection
- Token refresh for session extension
- Secure logout with token blacklisting
"""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from auth import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from database import get_db
from dependencies import get_current_user
from models import AuditLog, TokenBlacklist, User
from schemas import (
    LoginRequest,
    MessageResponse,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)

router = APIRouter(tags=["Authentication"])

# Security configuration
MAX_FAILED_ATTEMPTS = 5
VALID_ROLES = ["user", "moderator", "admin"]


def log_action(
    db: Session,
    email: str,
    ip: str,
    action: str,
    status: str,
    user_agent: str | None = None
) -> None:
    """
    Record an authentication event in the audit log.

    Args:
        db: Database session.
        email: User email associated with the action.
        ip: Client IP address.
        action: Event type (LOGIN, REGISTER, LOGOUT, FAILED_LOGIN, LOCKED).
        status: Result of the action (SUCCESS, FAILED).
        user_agent: Optional browser user agent string.
    """
    entry = AuditLog(
        email=email,
        ip_address=ip,
        action=action,
        status=status,
        user_agent=user_agent,
    )
    db.add(entry)
    db.commit()


@router.post("/register", response_model=UserResponse, status_code=201)
def register(
    payload: RegisterRequest,
    request: Request,
    db: Session = Depends(get_db)
) -> User:
    """
    Register a new user account.

    Creates a new user with hashed password and validates uniqueness
    of email and username. Logs registration event to audit log.
    """
    ip = request.client.host
    ua = request.headers.get("user-agent", "")

    # Check for duplicate email
    existing_email = db.query(User).filter(User.email == payload.email).first()
    if existing_email:
        raise HTTPException(status_code=409, detail="Email already registered")

    # Check for duplicate username  
    existing_username = db.query(User).filter(User.username == payload.username).first()
    if existing_username:
        raise HTTPException(status_code=409, detail="Username already taken")

    # Validate role against allowed values
    role = payload.role if payload.role in VALID_ROLES else "user"

    user = User(
        username=payload.username,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    log_action(db, payload.email, ip, "REGISTER", "SUCCESS", ua)
    return user


@router.post("/login", response_model=TokenResponse)
def login(
    payload: LoginRequest,
    request: Request,
    db: Session = Depends(get_db)
) -> TokenResponse:
    """
    Authenticate user and issue JWT tokens.

    Validates credentials with brute-force protection. Locks account
    after MAX_FAILED_ATTEMPTS. Returns access and refresh tokens on success.
    """
    ip = request.client.host
    ua = request.headers.get("user-agent", "")

    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        log_action(db, payload.email, ip, "FAILED_LOGIN", "FAILED", ua)
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Reject locked accounts
    if user.is_locked:
        log_action(db, payload.email, ip, "FAILED_LOGIN", "FAILED", ua)
        raise HTTPException(status_code=423, detail="Account is locked due to too many failed attempts")

    # Wrong password path
    if not verify_password(payload.password, user.hashed_password):
        user.failed_attempts += 1

        if user.failed_attempts >= MAX_FAILED_ATTEMPTS:
            user.is_locked = True
            db.commit()
            log_action(db, payload.email, ip, "LOCKED", "FAILED", ua)
            raise HTTPException(status_code=423, detail="Account locked after too many failed attempts")

        db.commit()
        log_action(db, payload.email, ip, "FAILED_LOGIN", "FAILED", ua)
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Successful login
    user.failed_attempts = 0
    user.last_login = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)

    token_data = {"sub": str(user.id), "email": user.email, "role": user.role}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    log_action(db, payload.email, ip, "LOGIN", "SUCCESS", ua)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user),
    )


@router.post("/logout", response_model=MessageResponse)
def logout(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MessageResponse:
    """
    Logout user and blacklist the current access token.

    Adds the JWT to the blacklist to prevent further use.
    """
    ip = request.client.host
    ua = request.headers.get("user-agent", "")

    # Extract raw token from Authorization header
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.replace("Bearer ", "")

    # Blacklist the token
    blacklist_entry = TokenBlacklist(token=token)
    db.add(blacklist_entry)
    db.commit()

    log_action(db, current_user.email, ip, "LOGOUT", "SUCCESS", ua)
    return MessageResponse(message="Successfully logged out")


@router.post("/refresh-token")
def refresh_token(
    payload: RefreshRequest,
    db: Session = Depends(get_db)
) -> dict:
    """
    Exchange refresh token for new access token.

    Validates the refresh token type and issues a new access token
    without requiring re-authentication.
    """
    token_data = decode_token(payload.refresh_token)

    # Enforce refresh-only tokens
    if token_data.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token type")

    new_access_token = create_access_token(
        {
            "sub": token_data["sub"],
            "email": token_data["email"],
            "role": token_data["role"],
        }
    )
    return {"access_token": new_access_token, "token_type": "Bearer"}
