"""
인증 라우터
"""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Request, Response, HTTPException
from sqlalchemy.orm import Session

from core.database import get_db
from core.config import settings
from core.security import (
    get_current_admin,
    verify_refresh_token,
    create_token_pair,
    ADMIN_TOKEN_COOKIE,
    ADMIN_REFRESH_TOKEN_COOKIE,
)
from core.token_blacklist import add_token_to_blacklist, is_token_blacklisted
from common.responses import SuccessResponse
from .schemas import (
    LoginRequest,
    LoginResponse,
    AdminCreate,
    AdminResponse,
    PasswordChangeRequest,
    TokenRefreshResponse,
)
from .service import AuthService
from .models import Admin

router = APIRouter(prefix="/auth", tags=["인증"])


@router.post("/login", response_model=SuccessResponse[LoginResponse])
async def login(
    request: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    """
    관리자 로그인 - Access/Refresh Token 발급
    """
    service = AuthService(db)
    result = service.login(request)

    # httpOnly 쿠키에 토큰 설정
    response.set_cookie(
        key=ADMIN_TOKEN_COOKIE,
        value=result.access_token,
        httponly=True,
        secure=not settings.DEBUG,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    response.set_cookie(
        key=ADMIN_REFRESH_TOKEN_COOKIE,
        value=result.refresh_token,
        httponly=True,
        secure=not settings.DEBUG,
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/api/auth/refresh",
    )

    return SuccessResponse(message="로그인 성공", data=result)


@router.post("/refresh", response_model=SuccessResponse[TokenRefreshResponse])
async def refresh_token(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    """
    Access Token 갱신
    """
    refresh_token = request.cookies.get(ADMIN_REFRESH_TOKEN_COOKIE)
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token이 없습니다")

    # Refresh Token 검증
    payload = verify_refresh_token(refresh_token, token_type="admin")
    if not payload:
        raise HTTPException(status_code=401, detail="유효하지 않은 refresh token입니다")

    # 블랙리스트 확인
    jti = payload.get("jti")
    if jti and await is_token_blacklisted(jti, db):
        raise HTTPException(status_code=401, detail="이미 로그아웃된 토큰입니다")

    # 관리자 정보 조회
    admin_id = int(payload.get("sub"))
    admin = db.query(Admin).filter(Admin.id == admin_id).first()
    if not admin or not admin.is_active:
        raise HTTPException(status_code=401, detail="유효하지 않은 관리자입니다")

    # 이전 토큰 블랙리스트에 추가
    if jti:
        exp = payload.get("exp")
        if exp:
            expires_at = datetime.fromtimestamp(exp, tz=timezone.utc)
            await add_token_to_blacklist(
                jti=jti,
                expires_at=expires_at,
                token_type="refresh",
                user_type="admin",
                user_id=admin_id,
                db=db,
            )

    # 새 토큰 발급
    token_data = {
        "sub": str(admin.id),
        "email": admin.email,
        "name": admin.name,
        "role": admin.role,
    }
    new_access, new_refresh = create_token_pair(token_data, token_type="admin")

    # 새 쿠키 설정
    response.set_cookie(
        key=ADMIN_TOKEN_COOKIE,
        value=new_access,
        httponly=True,
        secure=not settings.DEBUG,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    response.set_cookie(
        key=ADMIN_REFRESH_TOKEN_COOKIE,
        value=new_refresh,
        httponly=True,
        secure=not settings.DEBUG,
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/api/auth/refresh",
    )

    result = TokenRefreshResponse(
        access_token=new_access,
        refresh_token=new_refresh,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        refresh_expires_in=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
    )

    return SuccessResponse(message="토큰 갱신 성공", data=result)


@router.post("/logout", response_model=SuccessResponse[None])
async def logout(
    request: Request,
    response: Response,
    current_admin: dict = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    로그아웃 - 토큰을 블랙리스트에 추가
    """
    # Access Token 블랙리스트 추가
    jti = current_admin.get("jti")
    exp = current_admin.get("exp")
    if jti and exp:
        expires_at = datetime.fromtimestamp(exp, tz=timezone.utc)
        await add_token_to_blacklist(
            jti=jti,
            expires_at=expires_at,
            token_type="access",
            user_type="admin",
            user_id=int(current_admin.get("sub", 0)),
            db=db,
        )

    # Refresh Token 블랙리스트 추가
    refresh_token = request.cookies.get(ADMIN_REFRESH_TOKEN_COOKIE)
    if refresh_token:
        payload = verify_refresh_token(refresh_token, token_type="admin")
        if payload:
            refresh_jti = payload.get("jti")
            refresh_exp = payload.get("exp")
            if refresh_jti and refresh_exp:
                expires_at = datetime.fromtimestamp(refresh_exp, tz=timezone.utc)
                await add_token_to_blacklist(
                    jti=refresh_jti,
                    expires_at=expires_at,
                    token_type="refresh",
                    user_type="admin",
                    user_id=int(current_admin.get("sub", 0)),
                    db=db,
                )

    # 쿠키 삭제
    response.delete_cookie(key=ADMIN_TOKEN_COOKIE, path="/")
    response.delete_cookie(key=ADMIN_REFRESH_TOKEN_COOKIE, path="/api/auth/refresh")

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
