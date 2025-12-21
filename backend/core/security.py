"""
보안 관련 유틸리티
"""

from datetime import datetime, timedelta, timezone
from typing import Optional, Any
from jose import JWTError, jwt
import bcrypt
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from .config import settings
from .database import get_db

# Bearer 토큰 스키마
bearer_scheme = HTTPBearer()

# 쿠키 이름
USER_TOKEN_COOKIE = "user_token"


def get_password_hash(password: str) -> str:
    """비밀번호 해시 생성"""
    password_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """비밀번호 검증"""
    password_bytes = plain_password.encode("utf-8")
    hashed_bytes = hashed_password.encode("utf-8")
    return bcrypt.checkpw(password_bytes, hashed_bytes)


def create_access_token(
    data: dict[str, Any],
    expires_delta: Optional[timedelta] = None,
) -> str:
    """JWT 액세스 토큰 생성"""
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )
    return encoded_jwt


def verify_token(token: str) -> Optional[dict[str, Any]]:
    """JWT 토큰 검증"""
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        return payload
    except JWTError:
        return None


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    """현재 인증된 사용자 반환 (Authorization 헤더 사용 - 관리자용)"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="인증 정보가 유효하지 않습니다",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token = credentials.credentials
    payload = verify_token(token)

    if payload is None:
        raise credentials_exception

    user_id: Optional[str] = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    # 여기서 실제 DB에서 사용자 조회
    # user = db.query(User).filter(User.id == user_id).first()
    # if user is None:
    #     raise credentials_exception

    return payload


async def get_current_user_from_cookie(
    request: Request,
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    """현재 인증된 사용자 반환 (httpOnly 쿠키 사용 - 일반 회원용)"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="인증 정보가 유효하지 않습니다",
    )

    token = request.cookies.get(USER_TOKEN_COOKIE)
    if not token:
        raise credentials_exception

    # 사용자 토큰은 JWT_SECRET_KEY로 검증
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
    except JWTError:
        raise credentials_exception

    user_id: Optional[str] = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    # payload에 id 필드 추가 (기존 코드 호환성)
    payload["id"] = int(user_id)

    return payload


async def get_current_admin(
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    """현재 인증된 관리자 반환"""
    role = current_user.get("role")
    if role not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="관리자 권한이 필요합니다",
        )
    return current_user


async def require_super_admin(
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    """슈퍼 관리자 권한 필수"""
    role = current_user.get("role")
    if role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="슈퍼 관리자 권한이 필요합니다",
        )
    return current_user


# Optional bearer scheme (auto_error=False)
bearer_scheme_optional = HTTPBearer(auto_error=False)


async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme_optional),
    db: Session = Depends(get_db),
) -> Optional[dict[str, Any]]:
    """현재 인증된 사용자 반환 (선택적 - 비로그인 허용, Authorization 헤더)"""
    if credentials is None:
        return None

    token = credentials.credentials
    payload = verify_token(token)

    if payload is None:
        return None

    return payload


async def get_current_user_from_cookie_optional(
    request: Request,
    db: Session = Depends(get_db),
) -> Optional[dict[str, Any]]:
    """현재 인증된 사용자 반환 (선택적 - 비로그인 허용, httpOnly 쿠키)"""
    token = request.cookies.get(USER_TOKEN_COOKIE)
    if not token:
        return None

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
    except JWTError:
        return None

    user_id: Optional[str] = payload.get("sub")
    if user_id is None:
        return None

    # payload에 id 필드 추가 (기존 코드 호환성)
    payload["id"] = int(user_id)

    return payload
