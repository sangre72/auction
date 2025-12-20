"""
결제 모델
"""

from sqlalchemy import Column, Integer, String, DateTime, Numeric, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from core.database import Base


class PaymentStatus(str, enum.Enum):
    """결제 상태"""

    PENDING = "pending"  # 대기
    COMPLETED = "completed"  # 완료
    FAILED = "failed"  # 실패
    CANCELLED = "cancelled"  # 취소
    REFUNDED = "refunded"  # 환불


class PaymentMethod(str, enum.Enum):
    """결제 수단"""

    CARD = "card"  # 카드
    BANK_TRANSFER = "bank_transfer"  # 계좌이체
    VIRTUAL_ACCOUNT = "virtual_account"  # 가상계좌
    POINTS = "points"  # 포인트
    MIXED = "mixed"  # 복합 결제


class Payment(Base):
    """결제 테이블"""

    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)

    # 결제 정보
    order_id = Column(String(100), unique=True, index=True, nullable=False)
    payment_key = Column(String(255), nullable=True)  # PG사 결제 키
    method = Column(String(30), nullable=False)
    status = Column(String(20), default=PaymentStatus.PENDING.value, index=True)

    # 금액
    amount = Column(Numeric(12, 2), nullable=False)
    paid_amount = Column(Numeric(12, 2), default=0)
    points_used = Column(Integer, default=0)

    # 결제 상세
    pg_provider = Column(String(50), nullable=True)  # 토스, 나이스 등
    card_company = Column(String(50), nullable=True)
    card_number = Column(String(20), nullable=True)  # 마스킹된 번호

    # 추가 정보
    description = Column(String(500), nullable=True)
    failure_reason = Column(Text, nullable=True)
    refund_reason = Column(Text, nullable=True)

    # 타임스탬프
    paid_at = Column(DateTime(timezone=True), nullable=True)
    cancelled_at = Column(DateTime(timezone=True), nullable=True)
    refunded_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # 관계
    # user = relationship("User", back_populates="payments")
    # product = relationship("Product")
