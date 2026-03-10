"""
SQLAlchemy ORM models for AuthCore API.

This module defines the database schema for users, token blacklisting,
and audit logging. All models inherit from the SQLAlchemy Base.
"""
from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func
from database import Base


class User(Base):
    """
    User account model with authentication and security fields.

    Attributes:
        id: Primary key.
        username: Unique display name (max 50 chars).
        email: Unique email address for login (max 100 chars).
        hashed_password: Bcrypt password hash.
        role: User role ('user' or 'admin').
        is_locked: Account lockout status after failed attempts.
        failed_attempts: Counter for consecutive failed logins.
        created_at: Account creation timestamp.
        last_login: Most recent successful login timestamp.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="user", nullable=False)
    is_locked = Column(Boolean, default=False, nullable=False)
    failed_attempts = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    last_login = Column(DateTime, nullable=True)


class TokenBlacklist(Base):
    """
    Blacklisted JWT tokens for secure logout.

    When a user logs out, their refresh token is added here to prevent reuse.
    Tokens should be periodically cleaned up after expiration.

    Attributes:
        id: Primary key.
        token: The JWT token string (stored as Text for length).
        blacklisted_at: Timestamp when token was invalidated.
    """
    __tablename__ = "token_blacklist"

    id = Column(Integer, primary_key=True, index=True)
    token = Column(Text, nullable=False)
    blacklisted_at = Column(DateTime, default=func.now(), nullable=False)


class AuditLog(Base):
    """
    Security audit log for tracking authentication events.

    Records all login attempts, registrations, and account security events
    for compliance and security monitoring purposes.

    Attributes:
        id: Primary key.
        email: Email of the user performing the action.
        ip_address: Client IP address.
        action: Event type (LOGIN, REGISTER, LOGOUT, FAILED_LOGIN, LOCKED).
        status: Result of the action (SUCCESS, FAILED).
        user_agent: Browser/client user agent string.
        timestamp: When the event occurred.
    """
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), nullable=False)
    ip_address = Column(String(50), nullable=False)
    action = Column(String(50), nullable=False)
    status = Column(String(20), nullable=False)
    user_agent = Column(String(200), nullable=True)
    timestamp = Column(DateTime, default=func.now(), nullable=False)
