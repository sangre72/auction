"""
결제 서비스
"""

from typing import Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func as sql_func

from common.errors import NotFoundException, BadRequestException
from common.pagination import Pagination, PaginationParams
from .models import Payment, PaymentStatus
from .schemas import (
    PaymentResponse,
    PaymentListResponse,
    PaymentSearchParams,
    RefundRequest,
)


class PaymentService:
    """결제 서비스"""

    def __init__(self, db: Session):
        self.db = db

    def get_payment(self, payment_id: int) -> PaymentResponse:
        """결제 상세 조회"""
        payment = self.db.query(Payment).filter(Payment.id == payment_id).first()
        if not payment:
            raise NotFoundException(detail="결제 정보를 찾을 수 없습니다")
        return PaymentResponse.model_validate(payment)

    def get_payment_by_order_id(self, order_id: str) -> PaymentResponse:
        """주문번호로 결제 조회"""
        payment = self.db.query(Payment).filter(Payment.order_id == order_id).first()
        if not payment:
            raise NotFoundException(detail="결제 정보를 찾을 수 없습니다")
        return PaymentResponse.model_validate(payment)

    def get_payment_list(
        self,
        pagination: PaginationParams,
        search: Optional[PaymentSearchParams] = None,
    ) -> Pagination[PaymentListResponse]:
        """결제 목록 조회"""
        query = self.db.query(Payment)

        # 검색 조건 적용
        if search:
            if search.user_id:
                query = query.filter(Payment.user_id == search.user_id)
            if search.order_id:
                query = query.filter(Payment.order_id.ilike(f"%{search.order_id}%"))
            if search.status:
                query = query.filter(Payment.status == search.status)
            if search.method:
                query = query.filter(Payment.method == search.method)
            if search.start_date:
                query = query.filter(Payment.created_at >= search.start_date)
            if search.end_date:
                query = query.filter(Payment.created_at <= search.end_date)

        # 정렬 (최신순)
        query = query.order_by(Payment.created_at.desc())

        # 페이지네이션
        result = Pagination.from_query(query, pagination)

        return Pagination(
            items=[PaymentListResponse.model_validate(p) for p in result.items],
            total_count=result.total_count,
            page=result.page,
            page_size=result.page_size,
        )

    def refund_payment(
        self,
        payment_id: int,
        request: RefundRequest,
    ) -> PaymentResponse:
        """결제 환불"""
        payment = self.db.query(Payment).filter(Payment.id == payment_id).first()
        if not payment:
            raise NotFoundException(detail="결제 정보를 찾을 수 없습니다")

        if payment.status != PaymentStatus.COMPLETED.value:
            raise BadRequestException(detail="완료된 결제만 환불할 수 있습니다")

        # 환불 처리 (실제로는 PG사 API 호출 필요)
        payment.status = PaymentStatus.REFUNDED.value
        payment.refund_reason = request.reason
        payment.refunded_at = datetime.now(timezone.utc)

        self.db.commit()
        self.db.refresh(payment)

        return PaymentResponse.model_validate(payment)

    def cancel_payment(self, payment_id: int) -> PaymentResponse:
        """결제 취소"""
        payment = self.db.query(Payment).filter(Payment.id == payment_id).first()
        if not payment:
            raise NotFoundException(detail="결제 정보를 찾을 수 없습니다")

        if payment.status not in [
            PaymentStatus.PENDING.value,
            PaymentStatus.COMPLETED.value,
        ]:
            raise BadRequestException(detail="취소할 수 없는 결제 상태입니다")

        payment.status = PaymentStatus.CANCELLED.value
        payment.cancelled_at = datetime.now(timezone.utc)

        self.db.commit()
        self.db.refresh(payment)

        return PaymentResponse.model_validate(payment)

    def get_payment_stats(self) -> dict:
        """결제 통계"""
        today = datetime.now(timezone.utc).date()

        total_amount = (
            self.db.query(sql_func.sum(Payment.paid_amount))
            .filter(Payment.status == PaymentStatus.COMPLETED.value)
            .scalar()
            or 0
        )

        today_amount = (
            self.db.query(sql_func.sum(Payment.paid_amount))
            .filter(
                Payment.status == PaymentStatus.COMPLETED.value,
                sql_func.date(Payment.paid_at) == today,
            )
            .scalar()
            or 0
        )

        total_count = (
            self.db.query(Payment)
            .filter(Payment.status == PaymentStatus.COMPLETED.value)
            .count()
        )

        pending_count = (
            self.db.query(Payment)
            .filter(Payment.status == PaymentStatus.PENDING.value)
            .count()
        )

        return {
            "total_amount": float(total_amount),
            "today_amount": float(today_amount),
            "total_count": total_count,
            "pending_count": pending_count,
        }
