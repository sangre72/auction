"""
카테고리 모델
"""

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from core.database import Base


class Category(Base):
    """카테고리 모델"""

    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)  # 카테고리명
    slug = Column(String(100), unique=True, nullable=False)  # URL용 슬러그
    description = Column(Text, nullable=True)  # 설명
    icon = Column(String(255), nullable=True)  # 아이콘 URL 또는 이름
    image_url = Column(String(500), nullable=True)  # 카테고리 이미지

    # 계층 구조 지원
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    level = Column(Integer, default=0)  # 0: 대분류, 1: 중분류, 2: 소분류

    # 정렬 및 상태
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

    # 타임스탬프
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # 관계
    parent = relationship("Category", remote_side=[id], backref="children")
    products = relationship("Product", back_populates="category_rel")
