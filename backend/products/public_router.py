"""
상품 공개 API 라우터 (인증 불필요)
사용자 앱에서 사용하는 읽기 전용 엔드포인트
"""

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from core.database import get_db
from common.responses import SuccessResponse, PaginatedResponse, PaginationMeta
from common.pagination import PaginationParams
from .schemas import (
    ProductResponse,
    ProductListResponse,
    ProductSearchParams,
    SlotListResponse,
)
from .service import ProductService
from .models import ProductStatus

router = APIRouter(prefix="/public/products", tags=["상품 (공개)"])


@router.get("", response_model=PaginatedResponse[ProductListResponse])
async def get_public_product_list(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    title: Optional[str] = None,
    category: Optional[str] = None,
    category_id: Optional[int] = None,
    auction_type: Optional[str] = None,
    is_featured: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    """
    공개 상품 목록 조회 (활성 상품만)
    인증 없이 접근 가능
    """
    service = ProductService(db)
    pagination = PaginationParams(page=page, page_size=page_size)
    search = ProductSearchParams(
        title=title,
        category=category,
        category_id=category_id,
        status=ProductStatus.ACTIVE.value,  # 활성 상품만
        auction_type=auction_type,
        is_featured=is_featured,
        seller_id=None,
    )

    result = service.get_product_list(pagination, search)

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


@router.get("/{product_id}", response_model=SuccessResponse[ProductResponse])
async def get_public_product(
    product_id: int,
    db: Session = Depends(get_db),
):
    """
    공개 상품 상세 조회
    인증 없이 접근 가능, 활성 상품만 조회 가능
    """
    service = ProductService(db)
    product = service.get_product(product_id)

    # 활성 상태가 아니면 404
    if product.status != ProductStatus.ACTIVE.value:
        raise HTTPException(status_code=404, detail="상품을 찾을 수 없습니다")

    return SuccessResponse(data=product)


@router.get("/{product_id}/slots", response_model=SuccessResponse[list[SlotListResponse]])
async def get_public_product_slots(
    product_id: int,
    db: Session = Depends(get_db),
):
    """
    공개 상품 슬롯 목록 조회
    인증 없이 접근 가능
    """
    service = ProductService(db)

    # 상품이 활성 상태인지 확인
    product = service.get_product(product_id)
    if product.status != ProductStatus.ACTIVE.value:
        raise HTTPException(status_code=404, detail="상품을 찾을 수 없습니다")

    slots = service.get_product_slots(product_id)
    return SuccessResponse(data=slots)


@router.get("/{product_id}/slots/stats", response_model=SuccessResponse[dict])
async def get_public_slot_stats(
    product_id: int,
    db: Session = Depends(get_db),
):
    """
    공개 상품 슬롯 통계
    인증 없이 접근 가능
    """
    service = ProductService(db)

    # 상품이 활성 상태인지 확인
    product = service.get_product(product_id)
    if product.status != ProductStatus.ACTIVE.value:
        raise HTTPException(status_code=404, detail="상품을 찾을 수 없습니다")

    stats = service.get_slot_stats(product_id)
    return SuccessResponse(data=stats)
