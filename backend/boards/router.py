"""
게시판 관리자 라우터
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from core.database import get_db
from core.security import get_current_admin
from common.responses import SuccessResponse, PaginatedResponse, PaginationMeta
from common.pagination import PaginationParams
from .schemas import (
    BoardCreate, BoardUpdate, BoardResponse, BoardListResponse, BoardStats,
    PostCreate, PostUpdate, PostResponse, PostListResponse, PostSearchParams,
)
from .service import BoardService

router = APIRouter(prefix="/boards", tags=["게시판 관리"])


# ============================================
# Board (게시판) 관리
# ============================================

@router.get("/stats", response_model=SuccessResponse[BoardStats])
async def get_board_stats(
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """게시판 통계 조회"""
    service = BoardService(db)
    stats = service.get_board_stats()
    return SuccessResponse(data=stats)


@router.get("", response_model=PaginatedResponse[BoardListResponse])
async def get_board_list(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    is_active: Optional[bool] = None,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """게시판 목록 조회"""
    service = BoardService(db)
    pagination = PaginationParams(page=page, page_size=page_size)
    result = service.get_board_list(pagination, is_active)

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


@router.post("", response_model=SuccessResponse[BoardResponse])
async def create_board(
    data: BoardCreate,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """게시판 생성"""
    service = BoardService(db)
    board = service.create_board(data)
    return SuccessResponse(message="게시판이 생성되었습니다", data=board)


@router.get("/{board_id}", response_model=SuccessResponse[BoardResponse])
async def get_board(
    board_id: int,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """게시판 상세 조회"""
    service = BoardService(db)
    board = service.get_board(board_id)
    return SuccessResponse(data=board)


@router.patch("/{board_id}", response_model=SuccessResponse[BoardResponse])
async def update_board(
    board_id: int,
    data: BoardUpdate,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """게시판 수정"""
    service = BoardService(db)
    board = service.update_board(board_id, data)
    return SuccessResponse(message="게시판이 수정되었습니다", data=board)


@router.delete("/{board_id}", response_model=SuccessResponse[None])
async def delete_board(
    board_id: int,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """게시판 삭제"""
    service = BoardService(db)
    service.delete_board(board_id)
    return SuccessResponse(message="게시판이 삭제되었습니다")


@router.post("/reorder", response_model=SuccessResponse[None])
async def reorder_boards(
    board_ids: List[int],
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """게시판 순서 변경"""
    service = BoardService(db)
    service.reorder_boards(board_ids)
    return SuccessResponse(message="게시판 순서가 변경되었습니다")


# ============================================
# Post (게시글) 관리
# ============================================

@router.get("/{board_id}/posts", response_model=PaginatedResponse[PostListResponse])
async def get_post_list_admin(
    board_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    title: Optional[str] = None,
    status: Optional[str] = None,
    is_pinned: Optional[bool] = None,
    is_notice: Optional[bool] = None,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """게시글 목록 조회 (관리자)"""
    service = BoardService(db)
    pagination = PaginationParams(page=page, page_size=page_size)
    search = PostSearchParams(
        title=title,
        status=status,
        is_pinned=is_pinned,
        is_notice=is_notice,
    )

    result = service.get_post_list(board_id, pagination, search, include_hidden=True)

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


@router.post("/{board_id}/posts", response_model=SuccessResponse[PostResponse])
async def create_post_admin(
    board_id: int,
    data: PostCreate,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """게시글 생성 (관리자)"""
    data.board_id = board_id
    service = BoardService(db)
    post = service.create_post(data, author_id=int(current_admin["sub"]), is_admin=True)
    return SuccessResponse(message="게시글이 생성되었습니다", data=post)


@router.get("/posts/{post_id}", response_model=SuccessResponse[PostResponse])
async def get_post_admin(
    post_id: int,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """게시글 상세 조회 (관리자)"""
    service = BoardService(db)
    post = service.get_post(post_id, increment_view=False)
    return SuccessResponse(data=post)


@router.patch("/posts/{post_id}", response_model=SuccessResponse[PostResponse])
async def update_post_admin(
    post_id: int,
    data: PostUpdate,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """게시글 수정 (관리자)"""
    service = BoardService(db)
    post = service.update_post(
        post_id, data,
        current_user={"id": int(current_admin["sub"])},
        is_admin=True,
    )
    return SuccessResponse(message="게시글이 수정되었습니다", data=post)


@router.delete("/posts/{post_id}", response_model=SuccessResponse[None])
async def delete_post_admin(
    post_id: int,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """게시글 삭제 (관리자)"""
    service = BoardService(db)
    service.delete_post(
        post_id,
        current_user={"id": int(current_admin["sub"])},
        is_admin=True,
    )
    return SuccessResponse(message="게시글이 삭제되었습니다")


@router.post("/posts/{post_id}/notice", response_model=SuccessResponse[PostResponse])
async def set_post_notice(
    post_id: int,
    is_notice: bool = Query(...),
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """게시글 공지 설정 (관리자)"""
    service = BoardService(db)
    post = service.set_post_notice(post_id, is_notice)
    message = "공지로 설정되었습니다" if is_notice else "공지가 해제되었습니다"
    return SuccessResponse(message=message, data=post)


# ============================================
# Comment (댓글) 관리
# ============================================

@router.delete("/comments/{comment_id}", response_model=SuccessResponse[None])
async def delete_comment_admin(
    comment_id: int,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """댓글 삭제 (관리자)"""
    service = BoardService(db)
    service.delete_comment(
        comment_id,
        current_user={"id": int(current_admin["sub"])},
        is_admin=True,
    )
    return SuccessResponse(message="댓글이 삭제되었습니다")
