"""
결제 라우터
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
    PaymentResponse,
    PaymentListResponse,
    PaymentSearchParams,
    RefundRequest,
)
from .service import PaymentService

router = APIRouter(prefix="/payments", tags=["결제 관리"])


@router.get("", response_model=PaginatedResponse[PaymentListResponse])
async def get_payment_list(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user_id: Optional[int] = None,
    order_id: Optional[str] = None,
    status: Optional[str] = None,
    method: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    결제 목록 조회
    """
    service = PaymentService(db)
    pagination = PaginationParams(page=page, page_size=page_size)
    search = PaymentSearchParams(
        user_id=user_id,
        order_id=order_id,
        status=status,
        method=method,
        start_date=start_date,
        end_date=end_date,
    )

    result = service.get_payment_list(pagination, search)

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
async def get_payment_stats(
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    결제 통계 조회
    """
    service = PaymentService(db)
    stats = service.get_payment_stats()
    return SuccessResponse(data=stats)


@router.get("/{payment_id}", response_model=SuccessResponse[PaymentResponse])
async def get_payment(
    payment_id: int,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    결제 상세 조회
    """
    service = PaymentService(db)
    payment = service.get_payment(payment_id)
    return SuccessResponse(data=payment)


@router.get("/order/{order_id}", response_model=SuccessResponse[PaymentResponse])
async def get_payment_by_order(
    order_id: str,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    주문번호로 결제 조회
    """
    service = PaymentService(db)
    payment = service.get_payment_by_order_id(order_id)
    return SuccessResponse(data=payment)


@router.post("/{payment_id}/refund", response_model=SuccessResponse[PaymentResponse])
async def refund_payment(
    payment_id: int,
    request: RefundRequest,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    결제 환불
    """
    service = PaymentService(db)
    payment = service.refund_payment(payment_id, request)
    return SuccessResponse(message="환불이 처리되었습니다", data=payment)


@router.post("/{payment_id}/cancel", response_model=SuccessResponse[PaymentResponse])
async def cancel_payment(
    payment_id: int,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    결제 취소
    """
    service = PaymentService(db)
    payment = service.cancel_payment(payment_id)
    return SuccessResponse(message="결제가 취소되었습니다", data=payment)
