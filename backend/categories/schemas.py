"""
카테고리 스키마
"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class CategoryCreate(BaseModel):
    """카테고리 생성"""

    name: str
    slug: str
    description: Optional[str] = None
    icon: Optional[str] = None
    image_url: Optional[str] = None
    parent_id: Optional[int] = None
    level: int = 0
    sort_order: int = 0
    is_active: bool = True


class CategoryUpdate(BaseModel):
    """카테고리 수정"""

    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    image_url: Optional[str] = None
    parent_id: Optional[int] = None
    level: Optional[int] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class CategoryResponse(BaseModel):
    """카테고리 응답"""

    id: int
    name: str
    slug: str
    description: Optional[str] = None
    icon: Optional[str] = None
    image_url: Optional[str] = None
    parent_id: Optional[int] = None
    level: int
    sort_order: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CategoryListResponse(BaseModel):
    """카테고리 목록 응답"""

    id: int
    name: str
    slug: str
    icon: Optional[str] = None
    parent_id: Optional[int] = None
    level: int
    sort_order: int
    is_active: bool
    product_count: int = 0

    class Config:
        from_attributes = True


class CategoryTreeResponse(BaseModel):
    """카테고리 트리 응답 (계층 구조)"""

    id: int
    name: str
    slug: str
    icon: Optional[str] = None
    level: int
    sort_order: int
    is_active: bool
    children: List["CategoryTreeResponse"] = []

    class Config:
        from_attributes = True


# 순환 참조 해결
CategoryTreeResponse.model_rebuild()
