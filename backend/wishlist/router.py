"""
관심 상품 라우터 (마이페이지용)
"""

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import get_current_user_from_cookie
from common.responses import SuccessResponse, PaginatedResponse, PaginationMeta
from .schemas import WishlistItem, WishlistCheck, WishlistToggleResponse
from .service import WishlistService

router = APIRouter(prefix="/users/me/wishlist", tags=["관심 상품"])


@router.get("", response_model=PaginatedResponse[WishlistItem])
async def get_my_wishlist(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user_from_cookie),
    db: Session = Depends(get_db),
):
    """
    내 관심 상품 목록 조회
    """
    user_id = current_user["id"]
    service = WishlistService(db)

    items, total_count = service.get_user_wishlist(user_id, page, page_size)
    total_pages = (total_count + page_size - 1) // page_size if total_count > 0 else 1

    return PaginatedResponse(
        data=items,
        meta=PaginationMeta(
            page=page,
            page_size=page_size,
            total_count=total_count,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_prev=page > 1,
        ),
    )


@router.get("/{product_id}/check", response_model=SuccessResponse[WishlistCheck])
async def check_wishlist(
    product_id: int,
    current_user: dict = Depends(get_current_user_from_cookie),
    db: Session = Depends(get_db),
):
    """
    특정 상품 관심 등록 여부 확인
    """
    user_id = current_user["id"]
    service = WishlistService(db)

    is_wishlisted = service.check_wishlist(user_id, product_id)
    return SuccessResponse(data=WishlistCheck(is_wishlisted=is_wishlisted))


@router.post("/{product_id}", response_model=SuccessResponse[WishlistToggleResponse])
async def toggle_wishlist(
    product_id: int,
    current_user: dict = Depends(get_current_user_from_cookie),
    db: Session = Depends(get_db),
):
    """
    관심 상품 토글 (등록/해제)
    """
    user_id = current_user["id"]
    service = WishlistService(db)

    try:
        is_wishlisted, message = service.toggle_wishlist(user_id, product_id)
        return SuccessResponse(
            message=message,
            data=WishlistToggleResponse(
                is_wishlisted=is_wishlisted,
                message=message,
            ),
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{product_id}", response_model=SuccessResponse[WishlistCheck])
async def remove_from_wishlist(
    product_id: int,
    current_user: dict = Depends(get_current_user_from_cookie),
    db: Session = Depends(get_db),
):
    """
    관심 상품 삭제
    """
    user_id = current_user["id"]
    service = WishlistService(db)

    removed = service.remove_from_wishlist(user_id, product_id)
    if not removed:
        raise HTTPException(status_code=404, detail="관심 상품에 등록되어 있지 않습니다")

    return SuccessResponse(
        message="관심 상품에서 삭제되었습니다",
        data=WishlistCheck(is_wishlisted=False),
    )
