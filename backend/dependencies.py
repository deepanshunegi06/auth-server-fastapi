"""
FastAPI dependencies for authentication and authorization.

This module provides reusable dependencies for securing API endpoints,
including JWT token validation and role-based access control (RBAC).
"""
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

    # Check token blacklist
    blacklisted = db.query(TokenBlacklist).filter(TokenBlacklist.token == token).first()
    if blacklisted:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked",
        )

    payload = decode_token(token)
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


# Factory for role-based access control dependency
def require_role(*roles):
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required: {list(roles)}",
            )
        return current_user

    return role_checker
