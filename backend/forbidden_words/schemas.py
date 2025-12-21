"""
금칙어 스키마
"""

from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, List

from .models import ForbiddenWordType, ForbiddenWordTarget


class ForbiddenWordBase(BaseModel):
    """금칙어 기본 스키마"""
    word: str = Field(..., min_length=1, max_length=200)
    replacement: Optional[str] = Field(None, max_length=200)
    match_type: ForbiddenWordType = ForbiddenWordType.CONTAINS
    target: ForbiddenWordTarget = ForbiddenWordTarget.ALL
    is_active: bool = True
    reason: Optional[str] = None


class ForbiddenWordCreate(ForbiddenWordBase):
    """금칙어 생성 스키마"""
    pass


class ForbiddenWordUpdate(BaseModel):
    """금칙어 수정 스키마"""
    word: Optional[str] = Field(None, min_length=1, max_length=200)
    replacement: Optional[str] = Field(None, max_length=200)
    match_type: Optional[ForbiddenWordType] = None
    target: Optional[ForbiddenWordTarget] = None
    is_active: Optional[bool] = None
    reason: Optional[str] = None


class ForbiddenWordResponse(ForbiddenWordBase):
    """금칙어 응답 스키마"""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ForbiddenWordListResponse(BaseModel):
    """금칙어 목록 응답 스키마"""
    data: List[ForbiddenWordResponse]
    meta: dict


class CheckTextRequest(BaseModel):
    """텍스트 검사 요청 스키마"""
    text: str = Field(..., min_length=1)
    target: Optional[ForbiddenWordTarget] = None


class CheckTextResponse(BaseModel):
    """텍스트 검사 응답 스키마"""
    contains_forbidden: bool
    matched_words: List[str]
    filtered_text: Optional[str] = None
