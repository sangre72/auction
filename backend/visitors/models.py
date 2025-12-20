"""
방문자/통계 모델
"""

from sqlalchemy import Column, Integer, String, Date, DateTime, Text
from sqlalchemy.sql import func

from core.database import Base


class Visitor(Base):
    """방문자 로그 테이블"""

    __tablename__ = "visitors"

    id = Column(Integer, primary_key=True, index=True)

    # 방문자 정보
    ip_address = Column(String(45), nullable=True)  # IPv6 지원
    user_agent = Column(Text, nullable=True)
    device_type = Column(String(20), nullable=True)  # desktop, mobile, tablet
    browser = Column(String(50), nullable=True)
    os = Column(String(50), nullable=True)

    # 방문 정보
    page_url = Column(String(500), nullable=True)
    referrer = Column(String(500), nullable=True)
    session_id = Column(String(100), nullable=True, index=True)
    user_id = Column(Integer, nullable=True, index=True)  # 로그인한 경우

    # 위치 정보
    country = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)

    # 타임스탬프
    visited_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)


class DailyStats(Base):
    """일별 통계 테이블"""

    __tablename__ = "daily_stats"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, unique=True, index=True, nullable=False)

    # 방문자 통계
    total_visits = Column(Integer, default=0)
    unique_visitors = Column(Integer, default=0)
    new_visitors = Column(Integer, default=0)
    returning_visitors = Column(Integer, default=0)

    # 페이지뷰
    page_views = Column(Integer, default=0)
    avg_pages_per_session = Column(Integer, default=0)

    # 기기별 통계
    desktop_visits = Column(Integer, default=0)
    mobile_visits = Column(Integer, default=0)
    tablet_visits = Column(Integer, default=0)

    # 회원 통계
    new_signups = Column(Integer, default=0)
    active_users = Column(Integer, default=0)

    # 거래 통계
    total_orders = Column(Integer, default=0)
    total_revenue = Column(Integer, default=0)

    # 타임스탬프
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
