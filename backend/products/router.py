"""
상품 라우터
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from core.database import get_db
from core.security import get_current_admin
from common.responses import SuccessResponse, PaginatedResponse, PaginationMeta
from common.pagination import PaginationParams
from .schemas import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductListResponse,
    ProductSearchParams,
    SlotResponse,
    SlotListResponse,
    SlotPurchaseRequest,
    SlotUpdateRequest,
)
from .service import ProductService

router = APIRouter(prefix="/products", tags=["상품 관리"])


@router.get("", response_model=PaginatedResponse[ProductListResponse])
async def get_product_list(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    title: Optional[str] = None,
    category: Optional[str] = None,
    category_id: Optional[int] = None,
    status: Optional[str] = None,
    auction_type: Optional[str] = None,
    is_featured: Optional[bool] = None,
    seller_id: Optional[int] = None,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    상품 목록 조회
    """
    service = ProductService(db)
    pagination = PaginationParams(page=page, page_size=page_size)
    search = ProductSearchParams(
        title=title,
        category=category,
        category_id=category_id,
        status=status,
        auction_type=auction_type,
        is_featured=is_featured,
        seller_id=seller_id,
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


@router.get("/stats", response_model=SuccessResponse[dict])
async def get_product_stats(
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    상품 통계 조회
    """
    service = ProductService(db)
    stats = service.get_product_stats()
    return SuccessResponse(data=stats)


@router.post("", response_model=SuccessResponse[ProductResponse])
async def create_product(
    data: ProductCreate,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    상품 생성
    """
    service = ProductService(db)
    product = service.create_product(data)
    return SuccessResponse(message="상품이 생성되었습니다", data=product)


@router.get("/{product_id}", response_model=SuccessResponse[ProductResponse])
async def get_product(
    product_id: int,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    상품 상세 조회
    """
    service = ProductService(db)
    product = service.get_product(product_id)
    return SuccessResponse(data=product)


@router.patch("/{product_id}", response_model=SuccessResponse[ProductResponse])
async def update_product(
    product_id: int,
    data: ProductUpdate,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    상품 수정
    """
    service = ProductService(db)
    product = service.update_product(product_id, data)
    return SuccessResponse(message="상품이 수정되었습니다", data=product)


@router.delete("/{product_id}", response_model=SuccessResponse[None])
async def delete_product(
    product_id: int,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    상품 삭제
    """
    service = ProductService(db)
    service.delete_product(product_id)
    return SuccessResponse(message="상품이 삭제되었습니다")


@router.post("/{product_id}/approve", response_model=SuccessResponse[ProductResponse])
async def approve_product(
    product_id: int,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    상품 승인
    """
    service = ProductService(db)
    product = service.approve_product(product_id)
    return SuccessResponse(message="상품이 승인되었습니다", data=product)


@router.post("/{product_id}/reject", response_model=SuccessResponse[ProductResponse])
async def reject_product(
    product_id: int,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    상품 반려
    """
    service = ProductService(db)
    product = service.reject_product(product_id)
    return SuccessResponse(message="상품이 반려되었습니다", data=product)


@router.post("/{product_id}/featured", response_model=SuccessResponse[ProductResponse])
async def set_featured(
    product_id: int,
    is_featured: bool = True,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    추천 상품 설정
    """
    service = ProductService(db)
    product = service.set_featured(product_id, is_featured)
    message = "추천 상품으로 설정되었습니다" if is_featured else "추천 상품에서 해제되었습니다"
    return SuccessResponse(message=message, data=product)


# ============================================
# 슬롯 관련 엔드포인트
# ============================================

@router.get("/{product_id}/slots", response_model=SuccessResponse[list[SlotListResponse]])
async def get_product_slots(
    product_id: int,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    상품의 모든 슬롯 조회
    """
    service = ProductService(db)
    slots = service.get_product_slots(product_id)
    return SuccessResponse(data=slots)


@router.get("/{product_id}/slots/stats", response_model=SuccessResponse[dict])
async def get_slot_stats(
    product_id: int,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    상품 슬롯 통계
    """
    service = ProductService(db)
    stats = service.get_slot_stats(product_id)
    return SuccessResponse(data=stats)


@router.post("/{product_id}/slots/purchase", response_model=SuccessResponse[list[SlotResponse]])
async def purchase_slots(
    product_id: int,
    request: SlotPurchaseRequest,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    슬롯 구매 (예약)
    """
    service = ProductService(db)
    slots = service.purchase_slots(product_id, request)
    return SuccessResponse(message="슬롯이 예약되었습니다", data=slots)


@router.get("/slots/{slot_id}", response_model=SuccessResponse[SlotResponse])
async def get_slot(
    slot_id: int,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    슬롯 상세 조회
    """
    service = ProductService(db)
    slot = service.get_slot(slot_id)
    return SuccessResponse(data=slot)


@router.patch("/slots/{slot_id}", response_model=SuccessResponse[SlotResponse])
async def update_slot(
    slot_id: int,
    data: SlotUpdateRequest,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    슬롯 정보 수정
    """
    service = ProductService(db)
    slot = service.update_slot(slot_id, data)
    return SuccessResponse(message="슬롯이 수정되었습니다", data=slot)


@router.post("/slots/{slot_id}/confirm", response_model=SuccessResponse[SlotResponse])
async def confirm_slot_purchase(
    slot_id: int,
    payment_id: int,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    슬롯 구매 확정 (결제 완료)
    """
    service = ProductService(db)
    slot = service.confirm_slot_purchase(slot_id, payment_id)
    return SuccessResponse(message="구매가 확정되었습니다", data=slot)


@router.post("/slots/{slot_id}/cancel", response_model=SuccessResponse[SlotResponse])
async def cancel_slot(
    slot_id: int,
    admin_note: Optional[str] = None,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    슬롯 취소
    """
    service = ProductService(db)
    slot = service.cancel_slot(slot_id, admin_note)
    return SuccessResponse(message="슬롯이 취소되었습니다", data=slot)


@router.post("/slots/{slot_id}/reset", response_model=SuccessResponse[SlotResponse])
async def reset_slot(
    slot_id: int,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    슬롯 초기화 (다시 구매 가능)
    """
    service = ProductService(db)
    slot = service.reset_slot(slot_id)
    return SuccessResponse(message="슬롯이 초기화되었습니다", data=slot)
