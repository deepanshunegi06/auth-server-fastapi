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


# Return profile of currently authenticated user
@router.get("/profile", response_model=ProfileResponse)
def get_profile(current_user=Depends(get_current_user)):
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    return ProfileResponse(
        user_id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        role=current_user.role,
        token_expires_at=expires_at,
    )


# Admin: list all users
@router.get("/admin/users", response_model=list[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    _=Depends(require_role("admin")),
):
    return db.query(User).all()


# Admin: delete a user by id
@router.delete("/admin/user/{user_id}", response_model=MessageResponse)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("admin")),
):
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    return MessageResponse(message=f"User {user_id} deleted successfully")


# Admin: unlock a locked user
@router.patch("/admin/unlock/{user_id}", response_model=UserResponse)
def unlock_user(
    user_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_role("admin")),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_locked = False
    user.failed_attempts = 0
    db.commit()
    db.refresh(user)
    return user


# Admin: aggregate stats
@router.get("/admin/stats", response_model=StatsResponse)
def get_stats(
    db: Session = Depends(get_db),
    _=Depends(require_role("admin")),
):
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


# Moderator+Admin: full audit log
@router.get("/moderator/logs", response_model=list[AuditLogResponse])
def get_audit_logs(
    db: Session = Depends(get_db),
    _=Depends(require_role("admin", "moderator")),
):
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(AUDIT_LOG_LIMIT).all()


# Moderator+Admin: log statistics
@router.get("/moderator/logs/stats")
def get_log_stats(
    db: Session = Depends(get_db),
    _=Depends(require_role("admin", "moderator")),
):
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
