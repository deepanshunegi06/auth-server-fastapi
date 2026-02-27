from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator


class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: Optional[str] = "user"

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if len(v) > 100:
            raise ValueError("Password must be at most 100 characters")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
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
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in: int = 1800
    user: UserResponse


class RefreshRequest(BaseModel):
    refresh_token: str


class ProfileResponse(BaseModel):
    user_id: int
    username: str
    email: str
    role: str
    token_expires_at: datetime


class AuditLogResponse(BaseModel):
    id: int
    email: str
    ip_address: str
    action: str
    status: str
    user_agent: Optional[str] = None
    timestamp: datetime

    model_config = {"from_attributes": True}


class StatsResponse(BaseModel):
    total_users: int
    active_sessions: int
    failed_logins_today: int
    locked_accounts: int


class MessageResponse(BaseModel):
    message: str
    success: bool = True
