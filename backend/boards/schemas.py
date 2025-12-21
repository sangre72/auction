"""
게시판 스키마
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ============================================
# Board (게시판) 스키마
# ============================================

class BoardCreate(BaseModel):
    """게시판 생성"""
    name: str = Field(..., min_length=1, max_length=100)
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    read_permission: str = "public"
    write_permission: str = "login"
    comment_permission: str = "login"
    is_active: bool = True
    sort_order: int = 0
    allow_attachments: bool = True
    allow_images: bool = True
    max_attachments: int = 5


class BoardUpdate(BaseModel):
    """게시판 수정"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    read_permission: Optional[str] = None
    write_permission: Optional[str] = None
    comment_permission: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None
    allow_attachments: Optional[bool] = None
    allow_images: Optional[bool] = None
    max_attachments: Optional[int] = None


class BoardResponse(BaseModel):
    """게시판 응답"""
    id: int
    name: str
    title: str
    description: Optional[str] = None
    read_permission: str
    write_permission: str
    comment_permission: str
    is_active: bool
    sort_order: int
    allow_attachments: bool
    allow_images: bool
    max_attachments: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BoardListResponse(BaseModel):
    """게시판 목록 응답"""
    id: int
    name: str
    title: str
    description: Optional[str] = None
    is_active: bool
    sort_order: int
    post_count: int = 0

    class Config:
        from_attributes = True


class BoardStats(BaseModel):
    """게시판 통계"""
    total: int = 0
    active: int = 0
    inactive: int = 0
    total_posts: int = 0
    today_posts: int = 0


# ============================================
# Post (게시글) 스키마
# ============================================

class PostCreate(BaseModel):
    """게시글 생성"""
    board_id: int
    title: str = Field(..., min_length=1, max_length=300)
    content: str = Field(..., min_length=1)
    is_pinned: bool = False
    is_notice: bool = False
    image_urls: Optional[List[str]] = None


class PostUpdate(BaseModel):
    """게시글 수정"""
    title: Optional[str] = Field(None, min_length=1, max_length=300)
    content: Optional[str] = Field(None, min_length=1)
    status: Optional[str] = None
    is_pinned: Optional[bool] = None
    is_notice: Optional[bool] = None


class AuthorResponse(BaseModel):
    """작성자 정보"""
    id: int
    name: Optional[str] = None
    profile_image: Optional[str] = None


class PostImageResponse(BaseModel):
    """게시글 이미지 응답"""
    id: int
    image_url: str
    thumbnail_url: Optional[str] = None
    original_filename: Optional[str] = None
    sort_order: int

    class Config:
        from_attributes = True


class PostAttachmentResponse(BaseModel):
    """첨부파일 응답"""
    id: int
    file_url: str
    original_filename: str
    file_size: int
    file_type: Optional[str] = None
    download_count: int

    class Config:
        from_attributes = True


class PostResponse(BaseModel):
    """게시글 상세 응답"""
    id: int
    board_id: int
    board_name: str
    board_title: str
    author: Optional[AuthorResponse] = None
    title: str
    content: str
    status: str
    is_pinned: bool
    is_notice: bool
    view_count: int
    like_count: int
    comment_count: int
    images: List[PostImageResponse] = []
    attachments: List[PostAttachmentResponse] = []
    is_liked: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PostListResponse(BaseModel):
    """게시글 목록 응답"""
    id: int
    board_id: int
    author_name: Optional[str] = None
    title: str
    status: str
    is_pinned: bool
    is_notice: bool
    view_count: int
    like_count: int
    comment_count: int
    has_images: bool = False
    has_attachments: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


class PostSearchParams(BaseModel):
    """게시글 검색 파라미터"""
    title: Optional[str] = None
    content: Optional[str] = None
    author_name: Optional[str] = None
    status: Optional[str] = None
    is_pinned: Optional[bool] = None
    is_notice: Optional[bool] = None


# ============================================
# Comment (댓글) 스키마
# ============================================

class CommentCreate(BaseModel):
    """댓글 생성"""
    content: str = Field(..., min_length=1, max_length=1000)
    parent_id: Optional[int] = None


class CommentUpdate(BaseModel):
    """댓글 수정"""
    content: str = Field(..., min_length=1, max_length=1000)


class CommentResponse(BaseModel):
    """댓글 응답"""
    id: int
    post_id: int
    author: Optional[AuthorResponse] = None
    parent_id: Optional[int] = None
    content: str
    is_deleted: bool
    replies: List["CommentResponse"] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================
# Like (좋아요) 스키마
# ============================================

class LikeToggleResponse(BaseModel):
    """좋아요 토글 응답"""
    is_liked: bool
    like_count: int
    message: str
