"""
게시판 공개 라우터 (사용자용)
"""

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List

from core.database import get_db
from core.security import (
    get_current_user_from_cookie,
    get_current_user_from_cookie_optional,
)
from common.responses import SuccessResponse, PaginatedResponse, PaginationMeta
from common.pagination import PaginationParams
from common.errors import ForbiddenException
from .schemas import (
    BoardResponse, BoardListResponse,
    PostCreate, PostUpdate, PostResponse, PostListResponse, PostSearchParams,
    CommentCreate, CommentUpdate, CommentResponse,
    LikeToggleResponse,
)
from .service import BoardService
from .models import Board

router = APIRouter(prefix="/public/boards", tags=["게시판 (공개)"])


# ============================================
# Board (게시판) 공개 API
# ============================================

@router.get("", response_model=SuccessResponse[List[BoardListResponse]])
async def get_public_board_list(
    db: Session = Depends(get_db),
):
    """활성 게시판 목록 조회 (공개)"""
    service = BoardService(db)
    pagination = PaginationParams(page=1, page_size=100)
    result = service.get_board_list(pagination, is_active=True)
    return SuccessResponse(data=result.items)


@router.get("/{board_name}", response_model=SuccessResponse[BoardResponse])
async def get_public_board(
    board_name: str,
    current_user: Optional[dict] = Depends(get_current_user_from_cookie_optional),
    db: Session = Depends(get_db),
):
    """게시판 상세 조회 (공개)"""
    service = BoardService(db)
    board = service.get_board_by_name(board_name)

    if not service.check_read_permission(board, current_user):
        raise ForbiddenException(detail="이 게시판에 접근할 권한이 없습니다")

    return SuccessResponse(data=BoardResponse.model_validate(board))


# ============================================
# Post (게시글) 공개 API
# ============================================

@router.get("/{board_name}/posts", response_model=PaginatedResponse[PostListResponse])
async def get_public_post_list(
    board_name: str,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    title: Optional[str] = None,
    current_user: Optional[dict] = Depends(get_current_user_from_cookie_optional),
    db: Session = Depends(get_db),
):
    """게시글 목록 조회 (공개)"""
    service = BoardService(db)

    board = db.query(Board).filter(Board.name == board_name, Board.is_active == True).first()
    if not board:
        raise HTTPException(status_code=404, detail="게시판을 찾을 수 없습니다")

    if not service.check_read_permission(board, current_user):
        raise ForbiddenException(detail="이 게시판에 접근할 권한이 없습니다")

    pagination = PaginationParams(page=page, page_size=page_size)
    search = PostSearchParams(title=title)
    result = service.get_post_list(board.id, pagination, search)

    return PaginatedResponse(
        data=result.items,
        meta=PaginationMeta(
            page=result.page,
            page_size=result.page_size,
            total_count=result.total_count,
            total_pages=result.total_pages,
            has_next=result.has_next,
            has_prev=result.has_prev,
        ),
    )


@router.get("/{board_name}/posts/{post_id}", response_model=SuccessResponse[PostResponse])
async def get_public_post(
    board_name: str,
    post_id: int,
    current_user: Optional[dict] = Depends(get_current_user_from_cookie_optional),
    db: Session = Depends(get_db),
):
    """게시글 상세 조회 (공개)"""
    service = BoardService(db)

    board = db.query(Board).filter(Board.name == board_name, Board.is_active == True).first()
    if not board:
        raise HTTPException(status_code=404, detail="게시판을 찾을 수 없습니다")

    if not service.check_read_permission(board, current_user):
        raise ForbiddenException(detail="이 게시판에 접근할 권한이 없습니다")

    post = service.get_post(post_id, current_user)
    return SuccessResponse(data=post)


@router.post("/{board_name}/posts", response_model=SuccessResponse[PostResponse])
async def create_public_post(
    board_name: str,
    data: PostCreate,
    current_user: dict = Depends(get_current_user_from_cookie),
    db: Session = Depends(get_db),
):
    """게시글 작성 (로그인 필요)"""
    service = BoardService(db)

    board = db.query(Board).filter(Board.name == board_name, Board.is_active == True).first()
    if not board:
        raise HTTPException(status_code=404, detail="게시판을 찾을 수 없습니다")

    if not service.check_write_permission(board, current_user):
        raise ForbiddenException(detail="이 게시판에 글을 작성할 권한이 없습니다")

    data.board_id = board.id
    post = service.create_post(data, author_id=current_user["id"])
    return SuccessResponse(message="게시글이 작성되었습니다", data=post)


@router.patch("/{board_name}/posts/{post_id}", response_model=SuccessResponse[PostResponse])
async def update_public_post(
    board_name: str,
    post_id: int,
    data: PostUpdate,
    current_user: dict = Depends(get_current_user_from_cookie),
    db: Session = Depends(get_db),
):
    """게시글 수정 (로그인 필요, 본인만)"""
    service = BoardService(db)
    post = service.update_post(post_id, data, current_user)
    return SuccessResponse(message="게시글이 수정되었습니다", data=post)


@router.delete("/{board_name}/posts/{post_id}", response_model=SuccessResponse[None])
async def delete_public_post(
    board_name: str,
    post_id: int,
    current_user: dict = Depends(get_current_user_from_cookie),
    db: Session = Depends(get_db),
):
    """게시글 삭제 (로그인 필요, 본인만)"""
    service = BoardService(db)
    service.delete_post(post_id, current_user)
    return SuccessResponse(message="게시글이 삭제되었습니다")


# ============================================
# Comment (댓글) 공개 API
# ============================================

@router.get("/{board_name}/posts/{post_id}/comments", response_model=SuccessResponse[List[CommentResponse]])
async def get_comments(
    board_name: str,
    post_id: int,
    current_user: Optional[dict] = Depends(get_current_user_from_cookie_optional),
    db: Session = Depends(get_db),
):
    """댓글 목록 조회"""
    service = BoardService(db)

    board = db.query(Board).filter(Board.name == board_name).first()
    if not board or not service.check_read_permission(board, current_user):
        raise ForbiddenException(detail="접근 권한이 없습니다")

    comments = service.get_comments(post_id)
    return SuccessResponse(data=comments)


@router.post("/{board_name}/posts/{post_id}/comments", response_model=SuccessResponse[CommentResponse])
async def create_comment(
    board_name: str,
    post_id: int,
    data: CommentCreate,
    current_user: dict = Depends(get_current_user_from_cookie),
    db: Session = Depends(get_db),
):
    """댓글 작성"""
    service = BoardService(db)

    board = db.query(Board).filter(Board.name == board_name).first()
    if not board or not service.check_comment_permission(board, current_user):
        raise ForbiddenException(detail="댓글을 작성할 권한이 없습니다")

    comment = service.create_comment(post_id, data, current_user["id"])
    return SuccessResponse(message="댓글이 작성되었습니다", data=comment)


@router.patch("/comments/{comment_id}", response_model=SuccessResponse[CommentResponse])
async def update_comment(
    comment_id: int,
    data: CommentUpdate,
    current_user: dict = Depends(get_current_user_from_cookie),
    db: Session = Depends(get_db),
):
    """댓글 수정"""
    service = BoardService(db)
    comment = service.update_comment(comment_id, data, current_user)
    return SuccessResponse(message="댓글이 수정되었습니다", data=comment)


@router.delete("/comments/{comment_id}", response_model=SuccessResponse[None])
async def delete_comment(
    comment_id: int,
    current_user: dict = Depends(get_current_user_from_cookie),
    db: Session = Depends(get_db),
):
    """댓글 삭제"""
    service = BoardService(db)
    service.delete_comment(comment_id, current_user)
    return SuccessResponse(message="댓글이 삭제되었습니다")


# ============================================
# Like (좋아요) API
# ============================================

@router.post("/{board_name}/posts/{post_id}/like", response_model=SuccessResponse[LikeToggleResponse])
async def toggle_like(
    board_name: str,
    post_id: int,
    current_user: dict = Depends(get_current_user_from_cookie),
    db: Session = Depends(get_db),
):
    """좋아요 토글"""
    service = BoardService(db)
    result = service.toggle_like(post_id, current_user["id"])
    return SuccessResponse(message=result.message, data=result)


@router.get("/{board_name}/posts/{post_id}/like", response_model=SuccessResponse[dict])
async def get_like_status(
    board_name: str,
    post_id: int,
    current_user: dict = Depends(get_current_user_from_cookie),
    db: Session = Depends(get_db),
):
    """좋아요 상태 확인"""
    service = BoardService(db)
    is_liked = service.check_like_status(post_id, current_user["id"])
    return SuccessResponse(data={"is_liked": is_liked})
