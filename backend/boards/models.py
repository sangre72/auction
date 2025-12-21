"""
게시판 모델
"""

import enum
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime,
    ForeignKey, UniqueConstraint
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from core.database import Base


class ReadPermission(str, enum.Enum):
    """읽기 권한"""
    PUBLIC = "public"           # 전체 공개
    LOGIN = "login"             # 로그인 필수
    ADMIN = "admin"             # 관리자만


class WritePermission(str, enum.Enum):
    """쓰기 권한"""
    ADMIN = "admin"             # 관리자만
    LOGIN = "login"             # 로그인 필수


class CommentPermission(str, enum.Enum):
    """댓글 권한"""
    DISABLED = "disabled"       # 비허용
    LOGIN = "login"             # 로그인 필수


class PostStatus(str, enum.Enum):
    """게시글 상태"""
    DRAFT = "draft"             # 임시저장
    PUBLISHED = "published"     # 게시됨
    HIDDEN = "hidden"           # 숨김
    DELETED = "deleted"         # 삭제됨


class Board(Base):
    """게시판 테이블"""

    __tablename__ = "boards"

    id = Column(Integer, primary_key=True, index=True)

    # 기본 정보
    name = Column(String(100), nullable=False, unique=True, index=True)  # 게시판 영문명 (URL용)
    title = Column(String(200), nullable=False)                          # 게시판 제목
    description = Column(Text, nullable=True)                            # 설명

    # 권한 설정
    read_permission = Column(String(20), default=ReadPermission.PUBLIC.value)
    write_permission = Column(String(20), default=WritePermission.LOGIN.value)
    comment_permission = Column(String(20), default=CommentPermission.LOGIN.value)

    # 표시 설정
    is_active = Column(Boolean, default=True, index=True)
    sort_order = Column(Integer, default=0)

    # 기능 설정
    allow_attachments = Column(Boolean, default=True)
    allow_images = Column(Boolean, default=True)
    max_attachments = Column(Integer, default=5)

    # 타임스탬프
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # 관계
    posts = relationship("Post", back_populates="board", cascade="all, delete-orphan")


class Post(Base):
    """게시글 테이블"""

    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    board_id = Column(Integer, ForeignKey("boards.id", ondelete="CASCADE"), nullable=False, index=True)
    author_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    # 기본 정보
    title = Column(String(300), nullable=False)
    content = Column(Text, nullable=False)

    # 상태
    status = Column(String(20), default=PostStatus.PUBLISHED.value, index=True)
    is_pinned = Column(Boolean, default=False, index=True)    # 상단 고정
    is_notice = Column(Boolean, default=False, index=True)    # 공지사항

    # 통계
    view_count = Column(Integer, default=0)
    like_count = Column(Integer, default=0)
    comment_count = Column(Integer, default=0)

    # 타임스탬프
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # 관계
    board = relationship("Board", back_populates="posts")
    author = relationship("User", backref="posts")
    images = relationship("PostImage", back_populates="post", cascade="all, delete-orphan")
    attachments = relationship("PostAttachment", back_populates="post", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")
    likes = relationship("PostLike", back_populates="post", cascade="all, delete-orphan")


class PostImage(Base):
    """게시글 이미지 테이블"""

    __tablename__ = "post_images"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)

    image_url = Column(String(500), nullable=False)
    thumbnail_url = Column(String(500), nullable=True)
    original_filename = Column(String(255), nullable=True)
    file_size = Column(Integer, nullable=True)  # bytes
    sort_order = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 관계
    post = relationship("Post", back_populates="images")


class PostAttachment(Base):
    """게시글 첨부파일 테이블"""

    __tablename__ = "post_attachments"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)

    file_url = Column(String(500), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=False)  # bytes
    file_type = Column(String(100), nullable=True)  # MIME type
    download_count = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 관계
    post = relationship("Post", back_populates="attachments")


class Comment(Base):
    """댓글 테이블 (대댓글 지원)"""

    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    author_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    parent_id = Column(Integer, ForeignKey("comments.id", ondelete="CASCADE"), nullable=True, index=True)

    content = Column(Text, nullable=False)
    is_deleted = Column(Boolean, default=False)  # 소프트 삭제 (대댓글 보존)

    # 타임스탬프
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # 관계
    post = relationship("Post", back_populates="comments")
    author = relationship("User", backref="comments")
    parent = relationship("Comment", remote_side=[id], backref="replies")


class PostLike(Base):
    """게시글 좋아요 테이블"""

    __tablename__ = "post_likes"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 복합 유니크 제약조건
    __table_args__ = (
        UniqueConstraint("post_id", "user_id", name="uq_post_like_user"),
    )

    # 관계
    post = relationship("Post", back_populates="likes")
