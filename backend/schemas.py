"""
Pydantic schemas for request validation and response serialization.

This module defines all API request/response models with automatic validation.
Schemas are organized by feature: authentication, user profiles, and audit logs.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator
from auth import MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH


class RegisterRequest(BaseModel):
    """Request schema for user registration."""
    username: str
    email: EmailStr
    password: str
    role: Optional[str] = "user"

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < MIN_PASSWORD_LENGTH:
            raise ValueError(f"Password must be at least {MIN_PASSWORD_LENGTH} characters")
        if len(v) > MAX_PASSWORD_LENGTH:
            raise ValueError(f"Password must be at most {MAX_PASSWORD_LENGTH} characters")
        return v


class LoginRequest(BaseModel):
    """Request schema for user login with email and password."""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Response schema for user profile data."""
    id: int
    username: str
    email: str
    role: str
    is_locked: bool
    failed_attempts: int
    created_at: datetime
    last_login: Optional[datetime] = None

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    """Response schema for authentication tokens with user data."""
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in: int = 1800
    user: UserResponse


class RefreshRequest(BaseModel):
    """Request schema for token refresh."""
    refresh_token: str


class ProfileResponse(BaseModel):
    """Response schema for authenticated user profile."""
    user_id: int
    username: str
    email: str
    role: str
    token_expires_at: datetime


class AuditLogResponse(BaseModel):
    """Response schema for security audit log entries."""
    id: int
    email: str
    ip_address: str
    action: str
    status: str
    user_agent: Optional[str] = None
    timestamp: datetime

    model_config = {"from_attributes": True}


class StatsResponse(BaseModel):
    """Response schema for admin dashboard statistics."""
    total_users: int
    active_sessions: int
    failed_logins_today: int
    locked_accounts: int


class MessageResponse(BaseModel):
    """Generic response schema for simple messages."""
    message: str
    success: bool = True
