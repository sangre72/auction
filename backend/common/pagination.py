"""
페이지네이션 유틸리티
"""

from typing import TypeVar, Generic, Optional
from pydantic import BaseModel, Field
from sqlalchemy.orm import Query
from math import ceil

T = TypeVar("T")


class PaginationParams(BaseModel):
    """페이지네이션 파라미터"""

    page: int = Field(default=1, ge=1, description="페이지 번호")
    page_size: int = Field(default=20, ge=1, le=100, description="페이지 크기")

    @property
    def offset(self) -> int:
        """오프셋 계산"""
        return (self.page - 1) * self.page_size


class Pagination(Generic[T]):
    """페이지네이션 결과"""

    def __init__(
        self,
        items: list[T],
        total_count: int,
        page: int,
        page_size: int,
    ):
        self.items = items
        self.total_count = total_count
        self.page = page
        self.page_size = page_size
        self.total_pages = ceil(total_count / page_size) if page_size > 0 else 0

    @property
    def has_next(self) -> bool:
        """다음 페이지 존재 여부"""
        return self.page < self.total_pages

    @property
    def has_prev(self) -> bool:
        """이전 페이지 존재 여부"""
        return self.page > 1

    def to_dict(self) -> dict:
        """딕셔너리 변환"""
        return {
            "items": self.items,
            "meta": {
                "page": self.page,
                "page_size": self.page_size,
                "total_count": self.total_count,
                "total_pages": self.total_pages,
                "has_next": self.has_next,
                "has_prev": self.has_prev,
            },
        }

    @classmethod
    def from_query(
        cls,
        query: Query,
        params: PaginationParams,
    ) -> "Pagination[T]":
        """SQLAlchemy 쿼리에서 페이지네이션 생성"""
        total_count = query.count()
        items = query.offset(params.offset).limit(params.page_size).all()
        return cls(
            items=items,
            total_count=total_count,
            page=params.page,
            page_size=params.page_size,
        )
