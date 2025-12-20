"""
상품 모델
"""

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Numeric, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from core.database import Base


class ProductStatus(str, enum.Enum):
    """상품 상태"""

    DRAFT = "draft"  # 초안
    PENDING = "pending"  # 검토 대기
    ACTIVE = "active"  # 활성 (판매중)
    SOLD = "sold"  # 판매 완료
    CANCELLED = "cancelled"  # 취소됨
    EXPIRED = "expired"  # 만료됨


class AuctionType(str, enum.Enum):
    """경매 유형"""

    AUCTION = "auction"  # 경매
    FIXED_PRICE = "fixed_price"  # 고정가


class SlotStatus(str, enum.Enum):
    """슬롯 상태"""

    AVAILABLE = "available"  # 구매 가능
    RESERVED = "reserved"  # 예약됨 (결제 대기)
    SOLD = "sold"  # 판매 완료
    CANCELLED = "cancelled"  # 취소됨


class Product(Base):
    """상품 테이블"""

    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # 기본 정보
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)  # 레거시 (문자열)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True, index=True)  # 카테고리 FK

    # 가격 정보
    auction_type = Column(String(20), default=AuctionType.AUCTION.value)
    starting_price = Column(Numeric(12, 2), nullable=False)
    current_price = Column(Numeric(12, 2), nullable=True)
    buy_now_price = Column(Numeric(12, 2), nullable=True)
    min_bid_increment = Column(Numeric(12, 2), default=1000)
    slot_price = Column(Numeric(12, 2), nullable=True)  # 슬롯당 가격

    # 슬롯 정보
    slot_count = Column(Integer, default=1)  # 총 슬롯 수
    sold_slot_count = Column(Integer, default=0)  # 판매된 슬롯 수

    # 경매 정보
    start_time = Column(DateTime(timezone=True), nullable=True)
    end_time = Column(DateTime(timezone=True), nullable=True)
    bid_count = Column(Integer, default=0)

    # 상태
    status = Column(String(20), default=ProductStatus.DRAFT.value, index=True)
    is_featured = Column(Boolean, default=False)

    # 이미지
    thumbnail_url = Column(String(500), nullable=True)

    # 타임스탬프
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # 관계
    slots = relationship("ProductSlot", back_populates="product", cascade="all, delete-orphan")
    category_rel = relationship("Category", back_populates="products")


class ProductImage(Base):
    """상품 이미지 테이블"""

    __tablename__ = "product_images"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    image_url = Column(String(500), nullable=False)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ProductSlot(Base):
    """
    상품 슬롯 테이블
    상품의 slot_count만큼 row가 생성됨
    각 슬롯은 개별 구매 단위
    """

    __tablename__ = "product_slots"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    slot_number = Column(Integer, nullable=False)  # 1부터 시작하는 슬롯 번호

    # 구매 정보
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    status = Column(String(20), default=SlotStatus.AVAILABLE.value, index=True)

    # 결제 정보
    payment_id = Column(Integer, ForeignKey("payments.id"), nullable=True)
    paid_price = Column(Numeric(12, 2), nullable=True)  # 실제 결제 금액

    # 구매 시간
    reserved_at = Column(DateTime(timezone=True), nullable=True)  # 예약 시간
    purchased_at = Column(DateTime(timezone=True), nullable=True)  # 구매 완료 시간
    cancelled_at = Column(DateTime(timezone=True), nullable=True)  # 취소 시간

    # 추가 정보
    buyer_note = Column(Text, nullable=True)  # 구매자 메모
    admin_note = Column(Text, nullable=True)  # 관리자 메모

    # 타임스탬프
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # 관계
    product = relationship("Product", back_populates="slots")

    # 복합 유니크 제약조건: 같은 상품에 같은 슬롯 번호가 중복될 수 없음
    __table_args__ = (
        {"extend_existing": True},
    )
