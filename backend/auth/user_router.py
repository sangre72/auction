"""
일반 회원 인증 라우터
- 회원가입
- 로그인
- 내 정보 조회
"""

from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timedelta, timezone
import bcrypt
from jose import jwt

from core.database import get_db
from core.config import settings
from core.security import get_current_user_from_cookie
from common.responses import SuccessResponse
from users.models import User, AuthProvider, UserStatus

router = APIRouter(prefix="/user/auth", tags=["회원 인증"])

# 쿠키 설정
COOKIE_NAME = "user_token"
COOKIE_MAX_AGE = 60 * 60 * 24 * 7  # 7일 (초 단위)


# ============ Schemas ============

class UserRegisterRequest(BaseModel):
    """회원가입 요청"""
    email: EmailStr
    password: str
    name: str
    nickname: Optional[str] = None


class UserLoginRequest(BaseModel):
    """로그인 요청"""
    email: EmailStr
    password: str


class UserLoginResponse(BaseModel):
    """로그인 응답 (토큰은 httpOnly 쿠키로 전달)"""
    user: dict


class UserInfoResponse(BaseModel):
    """사용자 정보 응답"""
    id: int
    email: Optional[str]
    name: Optional[str]
    nickname: Optional[str]
    profile_image: Optional[str]
    provider: str
    point_balance: int
    created_at: datetime


# ============ Helper Functions ============

def hash_password(password: str) -> str:
    """비밀번호 해시"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(password: str, password_hash: str) -> bool:
    """비밀번호 검증"""
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))


def create_user_token(user: User) -> str:
    """사용자용 JWT 토큰 생성"""
    payload = {
        "sub": str(user.id),
        "email": user.email,
        "name": user.name,
        "type": "user",
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def set_auth_cookie(response: Response, token: str):
    """httpOnly 쿠키에 토큰 설정"""
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        max_age=COOKIE_MAX_AGE,
        httponly=True,  # JavaScript에서 접근 불가
        secure=not settings.DEBUG,  # HTTPS에서만 전송 (프로덕션)
        samesite="lax",  # CSRF 방지
        path="/",
    )


def clear_auth_cookie(response: Response):
    """인증 쿠키 삭제"""
    response.delete_cookie(
        key=COOKIE_NAME,
        path="/",
    )


# ============ Endpoints ============

@router.post("/register", response_model=SuccessResponse[UserLoginResponse])
async def register(
    request: UserRegisterRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    """
    회원가입
    """
    # 회원가입 허용 여부 확인
    if not settings.ENABLE_REGISTRATION:
        raise HTTPException(status_code=403, detail="현재 회원가입이 비활성화되어 있습니다.")

    if not settings.ENABLE_EMAIL_LOGIN:
        raise HTTPException(status_code=403, detail="이메일 로그인이 비활성화되어 있습니다.")

    # 이메일 중복 확인
    existing_user = db.query(User).filter(
        User.email == request.email,
        User.provider == AuthProvider.EMAIL.value,
    ).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="이미 사용 중인 이메일입니다.")

    # 비밀번호 유효성 검사
    if len(request.password) < 6:
        raise HTTPException(status_code=400, detail="비밀번호는 6자 이상이어야 합니다.")

    # 사용자 생성
    user = User(
        email=request.email,
        password_hash=hash_password(request.password),
        name=request.name,
        nickname=request.nickname or request.name,
        provider=AuthProvider.EMAIL.value,
        status=UserStatus.ACTIVE.value,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # 토큰 생성 및 쿠키 설정
    token = create_user_token(user)
    set_auth_cookie(response, token)

    return SuccessResponse(
        message="회원가입이 완료되었습니다.",
        data=UserLoginResponse(
            user={
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "nickname": user.nickname,
            }
        )
    )


@router.post("/login", response_model=SuccessResponse[UserLoginResponse])
async def login(
    request: UserLoginRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    """
    로그인
    """
    MAX_LOGIN_ATTEMPTS = 5  # 최대 로그인 시도 횟수

    # 이메일 로그인 허용 여부 확인
    if not settings.ENABLE_EMAIL_LOGIN:
        raise HTTPException(status_code=403, detail="이메일 로그인이 비활성화되어 있습니다.")

    # 사용자 조회
    user = db.query(User).filter(
        User.email == request.email,
        User.provider == AuthProvider.EMAIL.value,
    ).first()

    if not user:
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 올바르지 않습니다.")

    if not user.password_hash:
        raise HTTPException(status_code=401, detail="소셜 로그인으로 가입된 계정입니다.")

    # 계정 잠금 확인
    if user.locked_at:
        raise HTTPException(
            status_code=423,
            detail="계정이 잠겼습니다. 관리자에게 문의하세요."
        )

    # 비밀번호 확인
    if not verify_password(request.password, user.password_hash):
        # 로그인 실패 횟수 증가
        user.failed_login_count = (user.failed_login_count or 0) + 1

        # 5회 실패 시 계정 잠금
        if user.failed_login_count >= MAX_LOGIN_ATTEMPTS:
            user.locked_at = datetime.now(timezone.utc)
            user.status_reason = f"로그인 {MAX_LOGIN_ATTEMPTS}회 실패로 자동 잠금"
            db.commit()
            raise HTTPException(
                status_code=423,
                detail=f"로그인 {MAX_LOGIN_ATTEMPTS}회 실패로 계정이 잠겼습니다. 관리자에게 문의하세요."
            )

        db.commit()
        remaining = MAX_LOGIN_ATTEMPTS - user.failed_login_count
        raise HTTPException(
            status_code=401,
            detail=f"이메일 또는 비밀번호가 올바르지 않습니다. (남은 시도: {remaining}회)"
        )

    # 상태 확인
    if user.status != UserStatus.ACTIVE.value:
        raise HTTPException(status_code=403, detail="정지된 계정입니다.")

    # 로그인 성공: 실패 횟수 초기화 및 마지막 로그인 시간 업데이트
    user.failed_login_count = 0
    user.last_login_at = datetime.now(timezone.utc)
    db.commit()

    # 토큰 생성 및 쿠키 설정
    token = create_user_token(user)
    set_auth_cookie(response, token)

    return SuccessResponse(
        message="로그인 성공",
        data=UserLoginResponse(
            user={
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "nickname": user.nickname,
            }
        )
    )


@router.get("/me", response_model=SuccessResponse[UserInfoResponse])
async def get_me(
    current_user: dict = Depends(get_current_user_from_cookie),
    db: Session = Depends(get_db),
):
    """
    내 정보 조회
    """
    user = db.query(User).filter(User.id == current_user["id"]).first()

    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    return SuccessResponse(
        data=UserInfoResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            nickname=user.nickname,
            profile_image=user.profile_image,
            provider=user.provider,
            point_balance=user.point_balance,
            created_at=user.created_at,
        )
    )


@router.post("/logout", response_model=SuccessResponse[None])
async def logout(response: Response):
    """
    로그아웃 (httpOnly 쿠키 삭제)
    """
    clear_auth_cookie(response)
    return SuccessResponse(message="로그아웃 성공")
