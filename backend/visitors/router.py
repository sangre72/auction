"""
방문자/통계 라우터
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import date, datetime, timedelta

from core.database import get_db
from core.security import get_current_admin
from common.responses import SuccessResponse, PaginatedResponse, PaginationMeta
from common.pagination import PaginationParams
from .schemas import (
    VisitorListResponse,
    DailyStatsResponse,
    VisitorSearchParams,
    DashboardSummary,
)
from .service import VisitorService

router = APIRouter(prefix="/visitors", tags=["방문자/통계"])


@router.get("", response_model=PaginatedResponse[VisitorListResponse])
async def get_visitor_list(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    ip_address: Optional[str] = None,
    device_type: Optional[str] = None,
    user_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    방문자 로그 목록 조회
    """
    service = VisitorService(db)
    pagination = PaginationParams(page=page, page_size=page_size)
    search = VisitorSearchParams(
        ip_address=ip_address,
        device_type=device_type,
        user_id=user_id,
        start_date=start_date,
        end_date=end_date,
    )

    result = service.get_visitor_list(pagination, search)

    return PaginatedResponse(
        data=result.items,
        meta=PaginationMeta(
            page=result.page,
            page_size=result.page_size,
            total_count=result.total_count,
            total_pages=result.total_pages,
            has_next=result.has_next,
            has_prev=result.has_prev,
        ),
    )


@router.get("/stats", response_model=SuccessResponse[dict])
async def get_visitor_stats(
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    방문자 통계 요약
    """
    service = VisitorService(db)
    stats = service.get_visitor_stats()
    return SuccessResponse(data=stats)


@router.get("/daily", response_model=SuccessResponse[list[DailyStatsResponse]])
async def get_daily_stats(
    start_date: date = Query(default=None),
    end_date: date = Query(default=None),
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    일별 통계 조회
    """
    # 기본값: 최근 30일
    if not end_date:
        end_date = date.today()
    if not start_date:
        start_date = end_date - timedelta(days=30)

    service = VisitorService(db)
    stats = service.get_daily_stats(start_date, end_date)
    return SuccessResponse(data=stats)


@router.get("/dashboard", response_model=SuccessResponse[DashboardSummary])
async def get_dashboard_summary(
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    대시보드 요약 통계
    """
    service = VisitorService(db)
    summary = service.get_dashboard_summary()
    return SuccessResponse(data=summary)
