"""
포인트 라우터
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from core.database import get_db
from core.security import get_current_admin
from common.responses import SuccessResponse, PaginatedResponse, PaginationMeta
from common.pagination import PaginationParams
from .schemas import (
    PointHistoryResponse,
    PointHistoryListResponse,
    PointAdjustRequest,
    PointSearchParams,
    UserPointSummary,
)
from .service import PointService

router = APIRouter(prefix="/points", tags=["포인트 관리"])


@router.get("", response_model=PaginatedResponse[PointHistoryListResponse])
async def get_point_history_list(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user_id: Optional[int] = None,
    type: Optional[str] = None,
    reason: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    포인트 이력 목록 조회
    """
    service = PointService(db)
    pagination = PaginationParams(page=page, page_size=page_size)
    search = PointSearchParams(
        user_id=user_id,
        type=type,
        reason=reason,
        start_date=start_date,
        end_date=end_date,
    )

    result = service.get_point_history_list(pagination, search)

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
async def get_point_stats(
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    포인트 통계 조회
    """
    service = PointService(db)
    stats = service.get_point_stats()
    return SuccessResponse(data=stats)


@router.get("/users/{user_id}", response_model=SuccessResponse[UserPointSummary])
async def get_user_point_summary(
    user_id: int,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    사용자 포인트 요약 조회
    """
    service = PointService(db)
    summary = service.get_user_point_summary(user_id)
    return SuccessResponse(data=summary)


@router.post("/adjust", response_model=SuccessResponse[PointHistoryResponse])
async def adjust_points(
    request: PointAdjustRequest,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    포인트 조정 (추가/차감)
    """
    service = PointService(db)
    admin_id = int(current_admin["sub"])
    history = service.adjust_points(request, admin_id)

    action = "추가" if request.amount > 0 else "차감"
    return SuccessResponse(
        message=f"포인트가 {action}되었습니다",
        data=history,
    )
