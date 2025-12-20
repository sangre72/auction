"""
표준 응답 스키마
"""

from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel

T = TypeVar("T")


class SuccessResponse(BaseModel, Generic[T]):
    """성공 응답"""

    success: bool = True
    message: str = "성공"
    data: Optional[T] = None


class ErrorResponse(BaseModel):
    """에러 응답"""

    success: bool = False
    message: str
    error_code: Optional[str] = None
    details: Optional[dict[str, Any]] = None


class PaginationMeta(BaseModel):
    """페이지네이션 메타 정보"""

    page: int
    page_size: int
    total_count: int
    total_pages: int
    has_next: bool
    has_prev: bool


class PaginatedResponse(BaseModel, Generic[T]):
    """페이지네이션 응답"""

    success: bool = True
    message: str = "성공"
    data: list[T]
    meta: PaginationMeta
