"""
FastAPI dependencies for authentication and authorization.

This module provides reusable dependencies for securing API endpoints,
including JWT token validation and role-based access control (RBAC).
"""
from typing import Callable
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from auth import decode_token
from database import get_db
from models import TokenBlacklist, User

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """
    Dependency to extract and validate the current authenticated user.

    Validates the bearer token, checks if it's blacklisted, and returns
    the associated user object.

    Args:
        credentials: HTTP Bearer token from Authorization header.
        db: Database session dependency.

    Returns:
        User: The authenticated user object.

    Raises:
        HTTPException: 401 if token is invalid, revoked, or user not found.
    """
    token = credentials.credentials

    # Check token blacklist first for performance
    blacklisted = db.query(TokenBlacklist).filter(TokenBlacklist.token == token).first()
    if blacklisted:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked",
        )

    # Decode and validate token payload
    try:
        payload = decode_token(token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user


def require_role(*roles: str) -> Callable:
    """
    Factory for creating role-based access control dependencies.

    Creates a dependency that checks if the current user has one of the
    specified roles before allowing access to the endpoint.

    Args:
        *roles: Variable number of role names that are allowed access.

    Returns:
        Callable: A dependency function that validates user roles.

    Example:
        @app.get("/admin")
        def admin_only(user: User = Depends(require_role("admin"))):
            return {"message": "Admin access granted"}
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required: {list(roles)}",
            )
        return current_user

    return role_checker
