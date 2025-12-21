"""
금칙어 모델
"""

import enum
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func

from core.database import Base


class ForbiddenWordType(str, enum.Enum):
    """금칙어 타입"""
    EXACT = "exact"           # 정확히 일치
    CONTAINS = "contains"     # 포함
    REGEX = "regex"           # 정규식


class ForbiddenWordTarget(str, enum.Enum):
    """금칙어 적용 대상"""
    ALL = "all"               # 전체
    POST_TITLE = "post_title"   # 게시글 제목
    POST_CONTENT = "post_content" # 게시글 내용
    COMMENT = "comment"       # 댓글
    NICKNAME = "nickname"     # 닉네임


class ForbiddenWord(Base):
    """금칙어 테이블"""

    __tablename__ = "forbidden_words"

    id = Column(Integer, primary_key=True, index=True)

    # 금칙어 정보
    word = Column(String(200), nullable=False, index=True)
    replacement = Column(String(200), nullable=True)  # 대체 텍스트 (None이면 필터링)

    # 설정
    match_type = Column(String(20), default=ForbiddenWordType.CONTAINS.value)
    target = Column(String(30), default=ForbiddenWordTarget.ALL.value)
    is_active = Column(Boolean, default=True, index=True)

    # 메모
    reason = Column(Text, nullable=True)  # 금칙어 등록 사유

    # 타임스탬프
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
