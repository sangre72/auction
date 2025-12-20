"""
카테고리 라우터
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from core.database import get_db
from core.security import get_current_admin
from common.responses import SuccessResponse
from .schemas import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
    CategoryListResponse,
    CategoryTreeResponse,
)
from .service import CategoryService

router = APIRouter(prefix="/categories", tags=["카테고리 관리"])


@router.get("", response_model=SuccessResponse[List[CategoryListResponse]])
async def get_category_list(
    parent_id: Optional[int] = None,
    is_active: Optional[bool] = None,
    level: Optional[int] = None,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    카테고리 목록 조회
    """
    service = CategoryService(db)
    categories = service.get_category_list(
        parent_id=parent_id,
        is_active=is_active,
        level=level,
    )
    return SuccessResponse(data=categories)


@router.get("/tree", response_model=SuccessResponse[List[CategoryTreeResponse]])
async def get_category_tree(
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    카테고리 트리 조회 (계층 구조)
    """
    service = CategoryService(db)
    tree = service.get_category_tree()
    return SuccessResponse(data=tree)


@router.get("/stats", response_model=SuccessResponse[dict])
async def get_category_stats(
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    카테고리 통계
    """
    service = CategoryService(db)
    stats = service.get_stats()
    return SuccessResponse(data=stats)


@router.post("", response_model=SuccessResponse[CategoryResponse])
async def create_category(
    data: CategoryCreate,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    카테고리 생성
    """
    service = CategoryService(db)
    category = service.create_category(data)
    return SuccessResponse(message="카테고리가 생성되었습니다", data=category)


@router.get("/{category_id}", response_model=SuccessResponse[CategoryResponse])
async def get_category(
    category_id: int,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    카테고리 상세 조회
    """
    service = CategoryService(db)
    category = service.get_category(category_id)
    return SuccessResponse(data=category)


@router.get("/slug/{slug}", response_model=SuccessResponse[CategoryResponse])
async def get_category_by_slug(
    slug: str,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    슬러그로 카테고리 조회
    """
    service = CategoryService(db)
    category = service.get_category_by_slug(slug)
    return SuccessResponse(data=category)


@router.patch("/{category_id}", response_model=SuccessResponse[CategoryResponse])
async def update_category(
    category_id: int,
    data: CategoryUpdate,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    카테고리 수정
    """
    service = CategoryService(db)
    category = service.update_category(category_id, data)
    return SuccessResponse(message="카테고리가 수정되었습니다", data=category)


@router.delete("/{category_id}", response_model=SuccessResponse[None])
async def delete_category(
    category_id: int,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    카테고리 삭제
    """
    service = CategoryService(db)
    service.delete_category(category_id)
    return SuccessResponse(message="카테고리가 삭제되었습니다")
