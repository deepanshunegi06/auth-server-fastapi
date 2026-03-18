"""
Protected API routes requiring authentication.

This module contains endpoints that require valid JWT authentication:
- User profile access
- Admin user management
- Moderator audit log viewing
- Dashboard statistics
"""
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from auth import decode_token, ACCESS_TOKEN_EXPIRE_MINUTES
from database import get_db
from dependencies import get_current_user, require_role
from models import AuditLog, User
from schemas import (
    AuditLogResponse,
    MessageResponse,
    ProfileResponse,
    StatsResponse,
    UserResponse,
)

# Audit log query limit for pagination
AUDIT_LOG_LIMIT = 200

router = APIRouter(tags=["Protected"])


@router.get("/profile", response_model=ProfileResponse)
def get_profile(current_user: User = Depends(get_current_user)) -> ProfileResponse:
    """
    Get the authenticated user's profile information.

    Returns user details and token expiration time.
    """
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return ProfileResponse(
        user_id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        role=current_user.role,
        token_expires_at=expires_at,
    )


@router.get("/admin/users", response_model=list[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
) -> list[User]:
    """
    Get list of all registered users.

    Admin-only endpoint for user management.
    """
    return db.query(User).all()


@router.delete("/admin/user/{user_id}", response_model=MessageResponse)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("admin")),
) -> MessageResponse:
    """
    Delete a user account by ID.

    Admin-only endpoint. Cannot delete your own account for security.
    Validates user existence before deletion.
    """
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Store username for response message
    deleted_username = user.username

    db.delete(user)
    db.commit()
    
    return MessageResponse(message=f"User '{deleted_username}' deleted successfully")
    return MessageResponse(message=f"User {user_id} deleted successfully")


@router.patch("/admin/unlock/{user_id}", response_model=UserResponse)
def unlock_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
) -> User:
    """
    Unlock a locked user account.

    Admin-only endpoint to reset failed attempts and unlock status.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_locked = False
    user.failed_attempts = 0
    db.commit()
    db.refresh(user)
    return user


@router.get("/admin/stats", response_model=StatsResponse)
def get_stats(
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
) -> StatsResponse:
    """
    Get dashboard statistics for admin panel.

    Returns user counts, active sessions, and security metrics.
    """
    total_users = db.query(User).count()
    locked_accounts = db.query(User).filter(User.is_locked == True).count()

    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    failed_logins_today = (
        db.query(AuditLog)
        .filter(AuditLog.action == "FAILED_LOGIN", AuditLog.timestamp >= today_start)
        .count()
    )

    return StatsResponse(
        total_users=total_users,
        active_sessions=total_users - locked_accounts,
        failed_logins_today=failed_logins_today,
        locked_accounts=locked_accounts,
    )


@router.get("/moderator/logs", response_model=list[AuditLogResponse])
def get_audit_logs(
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin", "moderator")),
) -> list[AuditLog]:
    """
    Get recent audit log entries.

    Available to admin and moderator roles.
    """
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(AUDIT_LOG_LIMIT).all()


@router.get("/moderator/logs/stats")
def get_log_stats(
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin", "moderator")),
) -> dict:
    """
    Get aggregated audit log statistics.

    Returns counts by status and action type.
    """
    logs = db.query(AuditLog).all()
    total = len(logs)
    success_count = sum(1 for l in logs if l.status == "SUCCESS")
    failed_count = sum(1 for l in logs if l.status == "FAILED")
    locked_count = sum(1 for l in logs if l.action == "LOCKED")

    by_action = {}
    for log in logs:
        by_action[log.action] = by_action.get(log.action, 0) + 1

    return {
        "total": total,
        "success_count": success_count,
        "failed_count": failed_count,
        "locked_count": locked_count,
        "by_action": by_action,
    }
