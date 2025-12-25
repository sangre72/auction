"""
인증 플러그인 설정

다른 프로젝트에서 재정의하여 사용 가능한 인증 설정 클래스
의존성 주입을 통해 인증 동작을 커스터마이징할 수 있습니다.

Example:
    # 기본 설정 사용
    from core.auth_config import auth_plugin_config, AuthPluginConfig

    # 커스텀 설정
    custom_config = AuthPluginConfig(
        access_token_expire_minutes=60,
        admin_cookie_name="my_admin_session",
    )
"""

from pydantic_settings import BaseSettings
from typing import Literal, Optional
from functools import lru_cache


class AuthPluginConfig(BaseSettings):
    """
    인증 플러그인 설정

    다른 프로젝트에서 이 클래스를 상속하거나 인스턴스를 생성하여
    인증 동작을 커스터마이징할 수 있습니다.
    """

    # ========================================
    # JWT 토큰 설정
    # ========================================

    # 비밀 키 (프로덕션에서 반드시 변경 필요)
    secret_key: str = "your-secret-key-change-in-production"

    # JWT 알고리즘
    algorithm: str = "HS256"

    # Access Token 만료 시간 (분)
    access_token_expire_minutes: int = 30

    # Refresh Token 만료 시간 (일)
    refresh_token_expire_days: int = 7

    # ========================================
    # 쿠키 설정
    # ========================================

    # 관리자용 쿠키 이름
    admin_cookie_name: str = "admin_session"

    # 사용자용 쿠키 이름
    user_cookie_name: str = "user_token"

    # Refresh Token 쿠키 이름
    refresh_cookie_name: str = "refresh_token"

    # 쿠키 보안 설정 (프로덕션에서는 True)
    cookie_secure: bool = False

    # 쿠키 httpOnly 설정 (XSS 방지)
    cookie_httponly: bool = True

    # 쿠키 SameSite 설정
    cookie_samesite: Literal["strict", "lax", "none"] = "lax"

    # ========================================
    # 토큰 블랙리스트 설정
    # ========================================

    # 블랙리스트 백엔드: "db" (PostgreSQL) 또는 "redis"
    token_blacklist_backend: Literal["db", "redis"] = "db"

    # Redis URL (블랙리스트가 redis일 때 사용)
    redis_url: str = "redis://localhost:6379/0"

    # ========================================
    # 로그인 정책
    # ========================================

    # 이메일/비밀번호 로그인 허용
    enable_email_login: bool = True

    # 회원가입 허용
    enable_registration: bool = True

    # ========================================
    # 소셜 로그인 설정
    # ========================================

    # 소셜 로그인 프로바이더 활성화
    enable_kakao: bool = False
    enable_naver: bool = False
    enable_google: bool = False

    # ========================================
    # 보안 설정
    # ========================================

    # 비밀번호 해싱 알고리즘
    password_hash_scheme: str = "bcrypt"

    # 비밀번호 최소 길이
    password_min_length: int = 8

    # 로그인 시도 제한 (실패 횟수)
    max_login_attempts: int = 5

    # 로그인 잠금 시간 (분)
    login_lockout_minutes: int = 15

    class Config:
        env_prefix = "AUTH_"
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"


@lru_cache()
def get_auth_plugin_config() -> AuthPluginConfig:
    """인증 플러그인 설정 인스턴스 반환 (캐시됨)"""
    return AuthPluginConfig()


# 기본 인스턴스 (대부분의 경우 이것을 사용)
auth_plugin_config = get_auth_plugin_config()
