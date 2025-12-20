"""
사용자 스키마
"""

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserResponse(BaseModel):
    """사용자 응답"""

    id: int
    email: Optional[str] = None
    phone: Optional[str] = None
    name: Optional[str] = None
    nickname: Optional[str] = None
    profile_image: Optional[str] = None
    provider: str
    status: str
    is_verified: bool
    point_balance: int
    last_login_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    """사용자 목록 응답"""

    id: int
    email: Optional[str] = None
    name: Optional[str] = None
    nickname: Optional[str] = None
    provider: str
    status: str
    point_balance: int
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    """사용자 정보 수정"""

    name: Optional[str] = None
    nickname: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = None
    is_verified: Optional[bool] = None


class UserSearchParams(BaseModel):
    """사용자 검색 파라미터"""

    email: Optional[str] = None
    name: Optional[str] = None
    phone: Optional[str] = None
    provider: Optional[str] = None
    status: Optional[str] = None
