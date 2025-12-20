"""
인증 라우터
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import get_current_admin
from common.responses import SuccessResponse
from .schemas import (
    LoginRequest,
    LoginResponse,
    AdminCreate,
    AdminResponse,
    PasswordChangeRequest,
)
from .service import AuthService

router = APIRouter(prefix="/auth", tags=["인증"])


@router.post("/login", response_model=SuccessResponse[LoginResponse])
async def login(
    request: LoginRequest,
    db: Session = Depends(get_db),
):
    """
    관리자 로그인
    """
    service = AuthService(db)
    result = service.login(request)
    return SuccessResponse(message="로그인 성공", data=result)


@router.post("/logout", response_model=SuccessResponse[None])
async def logout(
    current_admin: dict = Depends(get_current_admin),
):
    """
    로그아웃 (클라이언트에서 토큰 삭제)
    """
    return SuccessResponse(message="로그아웃 성공")


@router.get("/me", response_model=SuccessResponse[AdminResponse])
async def get_current_admin_info(
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    현재 로그인한 관리자 정보 조회
    """
    service = AuthService(db)
    admin = service.get_admin(int(current_admin["sub"]))
    return SuccessResponse(data=admin)


@router.post("/password/change", response_model=SuccessResponse[None])
async def change_password(
    request: PasswordChangeRequest,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    비밀번호 변경
    """
    service = AuthService(db)
    service.change_password(int(current_admin["sub"]), request)
    return SuccessResponse(message="비밀번호가 변경되었습니다")


@router.post("/admins", response_model=SuccessResponse[AdminResponse])
async def create_admin(
    request: AdminCreate,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    새 관리자 생성 (super_admin만 가능)
    """
    if current_admin.get("role") != "super_admin":
        from common.errors import ForbiddenException

        raise ForbiddenException(detail="슈퍼 관리자만 관리자를 생성할 수 있습니다")

    service = AuthService(db)
    admin = service.create_admin(request)
    return SuccessResponse(message="관리자가 생성되었습니다", data=admin)


@router.get("/admins", response_model=SuccessResponse[list[AdminResponse]])
async def get_admin_list(
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    관리자 목록 조회
    """
    service = AuthService(db)
    admins = service.get_admin_list()
    return SuccessResponse(data=admins)
