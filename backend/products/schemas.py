"""
상품 스키마
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal


class ProductCreate(BaseModel):
    """상품 생성"""

    seller_id: int
    title: str
    description: Optional[str] = None
    category: Optional[str] = None  # 레거시 (문자열)
    category_id: Optional[int] = None  # 카테고리 FK
    auction_type: str = "auction"
    starting_price: Decimal
    buy_now_price: Optional[Decimal] = None
    min_bid_increment: Decimal = Decimal("1000")
    slot_price: Optional[Decimal] = None  # 슬롯당 가격
    slot_count: int = 1  # 슬롯 수 (기본 1)
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    thumbnail_url: Optional[str] = None


class ProductUpdate(BaseModel):
    """상품 수정"""

    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None  # 레거시 (문자열)
    category_id: Optional[int] = None  # 카테고리 FK
    auction_type: Optional[str] = None
    starting_price: Optional[Decimal] = None
    buy_now_price: Optional[Decimal] = None
    min_bid_increment: Optional[Decimal] = None
    slot_price: Optional[Decimal] = None
    slot_count: Optional[int] = None  # 슬롯 수 변경 (주의: 이미 판매된 슬롯이 있으면 줄일 수 없음)
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[str] = None
    is_featured: Optional[bool] = None
    thumbnail_url: Optional[str] = None


class ProductResponse(BaseModel):
    """상품 응답"""

    id: int
    seller_id: int
    title: str
    description: Optional[str] = None
    category: Optional[str] = None  # 레거시 (문자열)
    category_id: Optional[int] = None  # 카테고리 FK
    category_name: Optional[str] = None  # 카테고리명 (조회 시 조인)
    auction_type: str
    starting_price: Decimal
    current_price: Optional[Decimal] = None
    buy_now_price: Optional[Decimal] = None
    min_bid_increment: Optional[Decimal] = None
    slot_price: Optional[Decimal] = None
    slot_count: int
    sold_slot_count: int
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    bid_count: int
    status: str
    is_featured: bool
    thumbnail_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    """상품 목록 응답"""

    id: int
    title: str
    category: Optional[str] = None  # 레거시 (문자열)
    category_id: Optional[int] = None  # 카테고리 FK
    category_name: Optional[str] = None  # 카테고리명 (조회 시 조인)
    auction_type: str
    starting_price: Decimal
    current_price: Optional[Decimal] = None
    slot_price: Optional[Decimal] = None
    slot_count: int
    sold_slot_count: int
    bid_count: int
    status: str
    is_featured: bool
    thumbnail_url: Optional[str] = None
    end_time: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ProductSearchParams(BaseModel):
    """상품 검색 파라미터"""

    title: Optional[str] = None
    category: Optional[str] = None  # 레거시 (문자열)
    category_id: Optional[int] = None  # 카테고리 FK
    status: Optional[str] = None
    auction_type: Optional[str] = None
    is_featured: Optional[bool] = None
    seller_id: Optional[int] = None


# ============================================
# 슬롯 관련 스키마
# ============================================

class SlotResponse(BaseModel):
    """슬롯 응답"""

    id: int
    product_id: int
    slot_number: int
    buyer_id: Optional[int] = None
    status: str
    payment_id: Optional[int] = None
    paid_price: Optional[Decimal] = None
    reserved_at: Optional[datetime] = None
    purchased_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None
    buyer_note: Optional[str] = None
    admin_note: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SlotListResponse(BaseModel):
    """슬롯 목록 응답 (간략)"""

    id: int
    slot_number: int
    buyer_id: Optional[int] = None
    status: str
    paid_price: Optional[Decimal] = None
    purchased_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SlotPurchaseRequest(BaseModel):
    """슬롯 구매 요청"""

    buyer_id: int
    slot_numbers: list[int]  # 구매할 슬롯 번호들
    buyer_note: Optional[str] = None


class SlotUpdateRequest(BaseModel):
    """슬롯 업데이트 (관리자)"""

    status: Optional[str] = None
    admin_note: Optional[str] = None


class SlotSearchParams(BaseModel):
    """슬롯 검색 파라미터"""

    product_id: Optional[int] = None
    buyer_id: Optional[int] = None
    status: Optional[str] = None
