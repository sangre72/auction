"""
포인트 스키마
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PointHistoryResponse(BaseModel):
    """포인트 이력 응답"""

    id: int
    user_id: int
    type: str
    reason: str
    amount: int
    balance: int
    reference_id: Optional[str] = None
    description: Optional[str] = None
    admin_id: Optional[int] = None
    expires_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class PointHistoryListResponse(BaseModel):
    """포인트 이력 목록 응답"""

    id: int
    user_id: int
    type: str
    reason: str
    amount: int
    balance: int
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class PointAdjustRequest(BaseModel):
    """포인트 조정 요청"""

    user_id: int
    amount: int  # 양수: 추가, 음수: 차감
    reason: str = "admin"
    description: Optional[str] = None


class PointSearchParams(BaseModel):
    """포인트 검색 파라미터"""

    user_id: Optional[int] = None
    type: Optional[str] = None
    reason: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class UserPointSummary(BaseModel):
    """사용자 포인트 요약"""

    user_id: int
    balance: int
    total_earned: int
    total_used: int
    total_expired: int
