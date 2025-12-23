"""
보안 관련 유틸리티
"""

from datetime import datetime, timedelta, timezone
from typing import Optional, Any, Tuple
from jose import JWTError, jwt
import bcrypt
import uuid
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from .config import settings
from .database import get_db

# Bearer 토큰 스키마
bearer_scheme = HTTPBearer()
bearer_scheme_optional = HTTPBearer(auto_error=False)

# 쿠키 이름
USER_TOKEN_COOKIE = "user_token"
ADMIN_TOKEN_COOKIE = "admin_session"
USER_REFRESH_TOKEN_COOKIE = "user_refresh"
ADMIN_REFRESH_TOKEN_COOKIE = "admin_refresh"


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
    token_type: str = "admin",
) -> str:
    """JWT 액세스 토큰 생성"""
    to_encode = data.copy()
    jti = str(uuid.uuid4())

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode.update({
        "exp": expire,
        "jti": jti,
        "type": "access",
    })

    secret_key = settings.JWT_SECRET_KEY if token_type == "user" else settings.SECRET_KEY
    algorithm = settings.JWT_ALGORITHM if token_type == "user" else settings.ALGORITHM

    encoded_jwt = jwt.encode(
        to_encode,
        secret_key,
        algorithm=algorithm,
    )
    return encoded_jwt


def create_refresh_token(
    data: dict[str, Any],
    token_type: str = "admin",
) -> str:
    """JWT 리프레시 토큰 생성"""
    jti = str(uuid.uuid4())
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    to_encode = {
        "sub": data.get("sub"),
        "jti": jti,
        "type": "refresh",
        "token_type": token_type,
        "exp": expire,
    }

    secret_key = settings.JWT_SECRET_KEY if token_type == "user" else settings.SECRET_KEY
    algorithm = settings.JWT_ALGORITHM if token_type == "user" else settings.ALGORITHM

    encoded_jwt = jwt.encode(
        to_encode,
        secret_key,
        algorithm=algorithm,
    )
    return encoded_jwt


def create_token_pair(
    data: dict[str, Any],
    token_type: str = "admin",
) -> Tuple[str, str]:
    """Access Token + Refresh Token 쌍 생성"""
    access_token = create_access_token(data, token_type=token_type)
    refresh_token = create_refresh_token(data, token_type=token_type)
    return access_token, refresh_token


def verify_refresh_token(
    token: str,
    token_type: str = "admin",
) -> Optional[dict[str, Any]]:
    """Refresh Token 검증"""
    try:
        secret_key = settings.JWT_SECRET_KEY if token_type == "user" else settings.SECRET_KEY
        algorithm = settings.JWT_ALGORITHM if token_type == "user" else settings.ALGORITHM

        payload = jwt.decode(token, secret_key, algorithms=[algorithm])

        if payload.get("type") != "refresh":
            return None
        if payload.get("token_type") != token_type:
            return None

        return payload
    except JWTError:
        return None


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


async def get_current_admin_from_cookie(
    request: Request,
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    """현재 인증된 관리자 반환 (httpOnly 쿠키 사용)"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="인증 정보가 유효하지 않습니다",
    )

    token = request.cookies.get(ADMIN_TOKEN_COOKIE)
    if not token:
        raise credentials_exception

    payload = verify_token(token)
    if payload is None:
        raise credentials_exception

    role = payload.get("role")
    if role not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="관리자 권한이 필요합니다",
        )

    return payload


async def get_current_admin(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme_optional),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    """현재 인증된 관리자 반환 (쿠키 또는 Authorization 헤더)"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="인증 정보가 유효하지 않습니다",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = None

    # 1. 먼저 쿠키에서 토큰 확인 (httpOnly 쿠키 우선)
    cookie_token = request.cookies.get(ADMIN_TOKEN_COOKIE)
    if cookie_token:
        payload = verify_token(cookie_token)

    # 2. 쿠키가 없으면 Authorization 헤더 확인
    if payload is None and credentials:
        payload = verify_token(credentials.credentials)

    if payload is None:
        raise credentials_exception

    role = payload.get("role")
    if role not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="관리자 권한이 필요합니다",
        )

    return payload


async def require_super_admin(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme_optional),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    """슈퍼 관리자 권한 필수 (쿠키 또는 Authorization 헤더)"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="인증 정보가 유효하지 않습니다",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = None

    # 1. 먼저 쿠키에서 토큰 확인 (httpOnly 쿠키 우선)
    cookie_token = request.cookies.get(ADMIN_TOKEN_COOKIE)
    if cookie_token:
        payload = verify_token(cookie_token)

    # 2. 쿠키가 없으면 Authorization 헤더 확인
    if payload is None and credentials:
        payload = verify_token(credentials.credentials)

    if payload is None:
        raise credentials_exception

    role = payload.get("role")
    if role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="슈퍼 관리자 권한이 필요합니다",
        )
    return payload


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
