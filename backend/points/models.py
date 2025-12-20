"""
포인트 모델
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
import enum

from core.database import Base


class PointType(str, enum.Enum):
    """포인트 유형"""

    EARN = "earn"  # 적립
    USE = "use"  # 사용
    EXPIRE = "expire"  # 만료
    ADMIN_ADD = "admin_add"  # 관리자 추가
    ADMIN_DEDUCT = "admin_deduct"  # 관리자 차감
    REFUND = "refund"  # 환불


class PointReason(str, enum.Enum):
    """포인트 사유"""

    SIGNUP_BONUS = "signup_bonus"  # 가입 보너스
    PURCHASE = "purchase"  # 구매 적립
    REVIEW = "review"  # 리뷰 작성
    REFERRAL = "referral"  # 추천인
    EVENT = "event"  # 이벤트
    PAYMENT = "payment"  # 결제 사용
    ADMIN = "admin"  # 관리자 조정
    EXPIRED = "expired"  # 만료
    REFUND = "refund"  # 환불


class PointHistory(Base):
    """포인트 이력 테이블"""

    __tablename__ = "point_histories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # 포인트 정보
    type = Column(String(20), nullable=False)  # earn, use, expire, admin_add, admin_deduct
    reason = Column(String(50), nullable=False)
    amount = Column(Integer, nullable=False)  # 양수: 적립, 음수: 차감
    balance = Column(Integer, nullable=False)  # 거래 후 잔액

    # 관련 정보
    reference_id = Column(String(100), nullable=True)  # 관련 주문/결제 ID
    description = Column(Text, nullable=True)
    admin_id = Column(Integer, ForeignKey("admins.id"), nullable=True)

    # 만료 정보
    expires_at = Column(DateTime(timezone=True), nullable=True)

    # 타임스탬프
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 관계
    # user = relationship("User", back_populates="point_histories")
