"""
인증 스키마
"""

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class LoginRequest(BaseModel):
    """로그인 요청"""

    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    """로그인 응답"""

    access_token: str
    token_type: str = "Bearer"
    expires_in: int
    admin: "AdminResponse"


class TokenPayload(BaseModel):
    """JWT 토큰 페이로드"""

    sub: str  # admin id
    email: str
    name: str
    role: str
    exp: datetime


class AdminCreate(BaseModel):
    """관리자 생성 요청"""

    email: EmailStr
    password: str
    name: str
    role: str = "admin"


class AdminResponse(BaseModel):
    """관리자 응답"""

    id: int
    email: str
    name: str
    role: str
    is_active: bool
    last_login_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class PasswordChangeRequest(BaseModel):
    """비밀번호 변경 요청"""

    current_password: str
    new_password: str


class AdminUpdate(BaseModel):
    """관리자 정보 수정"""

    name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
