"""
배너 라우터
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from core.database import get_db
from core.security import get_current_admin
from common.responses import SuccessResponse, PaginatedResponse, PaginationMeta
from common.pagination import PaginationParams
from .schemas import (
    BannerCreate,
    BannerUpdate,
    BannerResponse,
    BannerListResponse,
    BannerSearchParams,
    BannerPublicResponse,
)
from .service import BannerService

router = APIRouter(prefix="/banners", tags=["배너 관리"])
public_router = APIRouter(prefix="/public/banners", tags=["배너 (공개)"])


@router.get("", response_model=PaginatedResponse[BannerListResponse])
async def get_banner_list(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    title: Optional[str] = None,
    position: Optional[str] = None,
    type: Optional[str] = None,
    is_active: Optional[bool] = None,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    배너 목록 조회
    """
    service = BannerService(db)
    pagination = PaginationParams(page=page, page_size=page_size)
    search = BannerSearchParams(
        title=title,
        position=position,
        type=type,
        is_active=is_active,
    )

    result = service.get_banner_list(pagination, search)

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
async def get_banner_stats(
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    배너 통계 조회
    """
    service = BannerService(db)
    stats = service.get_banner_stats()
    return SuccessResponse(data=stats)


@router.post("", response_model=SuccessResponse[BannerResponse])
async def create_banner(
    data: BannerCreate,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    배너 생성
    """
    service = BannerService(db)
    banner = service.create_banner(data)
    return SuccessResponse(message="배너가 생성되었습니다", data=banner)


@router.get("/{banner_id}", response_model=SuccessResponse[BannerResponse])
async def get_banner(
    banner_id: int,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    배너 상세 조회
    """
    service = BannerService(db)
    banner = service.get_banner(banner_id)
    return SuccessResponse(data=banner)


@router.patch("/{banner_id}", response_model=SuccessResponse[BannerResponse])
async def update_banner(
    banner_id: int,
    data: BannerUpdate,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    배너 수정
    """
    service = BannerService(db)
    banner = service.update_banner(banner_id, data)
    return SuccessResponse(message="배너가 수정되었습니다", data=banner)


@router.delete("/{banner_id}", response_model=SuccessResponse[None])
async def delete_banner(
    banner_id: int,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    배너 삭제
    """
    service = BannerService(db)
    service.delete_banner(banner_id)
    return SuccessResponse(message="배너가 삭제되었습니다")


@router.post("/{banner_id}/toggle", response_model=SuccessResponse[BannerResponse])
async def toggle_banner_active(
    banner_id: int,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    배너 활성화/비활성화 토글
    """
    service = BannerService(db)
    banner = service.toggle_active(banner_id)
    status = "활성화" if banner.is_active else "비활성화"
    return SuccessResponse(message=f"배너가 {status}되었습니다", data=banner)


@router.post("/sort", response_model=SuccessResponse[None])
async def update_banner_sort_order(
    orders: list[dict],
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    배너 순서 일괄 수정
    """
    service = BannerService(db)
    service.update_sort_order(orders)
    return SuccessResponse(message="배너 순서가 수정되었습니다")


@router.get("/detail-stats", response_model=SuccessResponse[list])
async def get_banner_detail_stats(
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    배너별 상세 통계 조회 (조회수, 클릭수, CTR)
    """
    service = BannerService(db)
    stats = service.get_banner_detail_stats()
    return SuccessResponse(data=stats)


# ============================================
# 공개 API (사용자용 - 인증 불필요)
# ============================================

@public_router.get("", response_model=SuccessResponse[list[BannerPublicResponse]])
async def get_active_banners(
    position: str = Query("main_top", description="배너 위치"),
    db: Session = Depends(get_db),
):
    """
    활성화된 배너 목록 조회 (사용자용)
    - 인증 불필요
    - is_active=True이고 현재 시간이 start_date ~ end_date 범위 내인 배너만 반환
    """
    service = BannerService(db)
    banners = service.get_active_banners(position)
    return SuccessResponse(data=banners)


@public_router.post("/{banner_id}/view", response_model=SuccessResponse[None])
async def record_banner_view(
    banner_id: int,
    db: Session = Depends(get_db),
):
    """
    배너 조회수 기록
    """
    service = BannerService(db)
    service.record_view(banner_id)
    return SuccessResponse(message="조회수가 기록되었습니다")


@public_router.post("/{banner_id}/click", response_model=SuccessResponse[None])
async def record_banner_click(
    banner_id: int,
    db: Session = Depends(get_db),
):
    """
    배너 클릭수 기록
    """
    service = BannerService(db)
    service.record_click(banner_id)
    return SuccessResponse(message="클릭수가 기록되었습니다")
