"""
방문자/통계 스키마
"""

from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class VisitorResponse(BaseModel):
    """방문자 로그 응답"""

    id: int
    ip_address: Optional[str] = None
    device_type: Optional[str] = None
    browser: Optional[str] = None
    os: Optional[str] = None
    page_url: Optional[str] = None
    referrer: Optional[str] = None
    session_id: Optional[str] = None
    user_id: Optional[int] = None
    country: Optional[str] = None
    city: Optional[str] = None
    visited_at: datetime

    class Config:
        from_attributes = True


class VisitorListResponse(BaseModel):
    """방문자 목록 응답"""

    id: int
    ip_address: Optional[str] = None
    device_type: Optional[str] = None
    page_url: Optional[str] = None
    user_id: Optional[int] = None
    visited_at: datetime

    class Config:
        from_attributes = True


class DailyStatsResponse(BaseModel):
    """일별 통계 응답"""

    id: int
    date: date
    total_visits: int
    unique_visitors: int
    new_visitors: int
    returning_visitors: int
    page_views: int
    desktop_visits: int
    mobile_visits: int
    tablet_visits: int
    new_signups: int
    active_users: int
    total_orders: int
    total_revenue: int

    class Config:
        from_attributes = True


class VisitorSearchParams(BaseModel):
    """방문자 검색 파라미터"""

    ip_address: Optional[str] = None
    device_type: Optional[str] = None
    user_id: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class DashboardSummary(BaseModel):
    """대시보드 요약"""

    # 오늘 통계
    today_visits: int
    today_unique_visitors: int
    today_signups: int
    today_revenue: int

    # 어제 대비
    visits_change: float
    visitors_change: float
    signups_change: float
    revenue_change: float

    # 전체 통계
    total_users: int
    total_products: int
    total_orders: int
