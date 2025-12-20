"""
사용자 라우터
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from core.database import get_db
from core.security import get_current_admin
from common.responses import SuccessResponse, PaginatedResponse, PaginationMeta
from common.pagination import PaginationParams
from .schemas import UserResponse, UserListResponse, UserUpdate, UserSearchParams
from .service import UserService

router = APIRouter(prefix="/users", tags=["사용자 관리"])


@router.get("", response_model=PaginatedResponse[UserListResponse])
async def get_user_list(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    email: Optional[str] = None,
    name: Optional[str] = None,
    phone: Optional[str] = None,
    provider: Optional[str] = None,
    status: Optional[str] = None,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    사용자 목록 조회
    """
    service = UserService(db)
    pagination = PaginationParams(page=page, page_size=page_size)
    search = UserSearchParams(
        email=email,
        name=name,
        phone=phone,
        provider=provider,
        status=status,
    )

    result = service.get_user_list(pagination, search)

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


@router.get("/stats", response_model=SuccessResponse[dict])
async def get_user_stats(
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    사용자 통계 조회
    """
    service = UserService(db)
    stats = service.get_user_count()
    return SuccessResponse(data=stats)


@router.get("/{user_id}", response_model=SuccessResponse[UserResponse])
async def get_user(
    user_id: int,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    사용자 상세 조회
    """
    service = UserService(db)
    user = service.get_user(user_id)
    return SuccessResponse(data=user)


@router.patch("/{user_id}", response_model=SuccessResponse[UserResponse])
async def update_user(
    user_id: int,
    data: UserUpdate,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    사용자 정보 수정
    """
    service = UserService(db)
    user = service.update_user(user_id, data)
    return SuccessResponse(message="사용자 정보가 수정되었습니다", data=user)


@router.post("/{user_id}/suspend", response_model=SuccessResponse[UserResponse])
async def suspend_user(
    user_id: int,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    사용자 정지
    """
    service = UserService(db)
    user = service.suspend_user(user_id)
    return SuccessResponse(message="사용자가 정지되었습니다", data=user)


@router.post("/{user_id}/activate", response_model=SuccessResponse[UserResponse])
async def activate_user(
    user_id: int,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    사용자 활성화
    """
    service = UserService(db)
    user = service.activate_user(user_id)
    return SuccessResponse(message="사용자가 활성화되었습니다", data=user)


@router.delete("/{user_id}", response_model=SuccessResponse[None])
async def delete_user(
    user_id: int,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    사용자 삭제 (소프트 삭제)
    """
    service = UserService(db)
    service.delete_user(user_id)
    return SuccessResponse(message="사용자가 삭제되었습니다")
