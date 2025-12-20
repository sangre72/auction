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
)
from .service import BannerService

router = APIRouter(prefix="/banners", tags=["배너 관리"])


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
