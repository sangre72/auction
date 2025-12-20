"""
결제 스키마
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal


class PaymentResponse(BaseModel):
    """결제 상세 응답"""

    id: int
    user_id: int
    product_id: Optional[int] = None
    order_id: str
    payment_key: Optional[str] = None
    method: str
    status: str
    amount: Decimal
    paid_amount: Decimal
    points_used: int
    pg_provider: Optional[str] = None
    card_company: Optional[str] = None
    card_number: Optional[str] = None
    description: Optional[str] = None
    failure_reason: Optional[str] = None
    refund_reason: Optional[str] = None
    paid_at: Optional[datetime] = None
    cancelled_at: Optional[datetime] = None
    refunded_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class PaymentListResponse(BaseModel):
    """결제 목록 응답"""

    id: int
    user_id: int
    order_id: str
    method: str
    status: str
    amount: Decimal
    paid_amount: Decimal
    pg_provider: Optional[str] = None
    paid_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class PaymentSearchParams(BaseModel):
    """결제 검색 파라미터"""

    user_id: Optional[int] = None
    order_id: Optional[str] = None
    status: Optional[str] = None
    method: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class RefundRequest(BaseModel):
    """환불 요청"""

    reason: str
    amount: Optional[Decimal] = None  # 부분 환불 금액 (없으면 전액 환불)
