"""
관심 상품 스키마
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class WishlistItem(BaseModel):
    """관심 상품 아이템"""
    id: int
    product_id: int
    product_title: str
    product_thumbnail: Optional[str] = None
    current_price: Optional[float] = None
    starting_price: float
    product_status: str
    bid_count: int
    slot_count: int
    sold_slot_count: int
    end_time: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class WishlistCheck(BaseModel):
    """관심 상품 여부"""
    is_wishlisted: bool


class WishlistToggleResponse(BaseModel):
    """관심 상품 토글 응답"""
    is_wishlisted: bool
    message: str
