"""
애플리케이션 설정
"""

from pydantic_settings import BaseSettings
from typing import Optional
from functools import lru_cache


class Settings(BaseSettings):
    """애플리케이션 설정"""

    # 앱 설정
    APP_NAME: str = "Auction Admin API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # 서버 설정
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # 데이터베이스
    DATABASE_URL: str = "postgresql://postgres:santape1@localhost/test_db"

    # JWT 설정
    SECRET_KEY: str = "your-secret-key-change-in-production"
    JWT_SECRET_KEY: str = "your-jwt-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24시간

    # 일반 회원 로그인 설정
    ENABLE_EMAIL_LOGIN: bool = True  # 이메일/비밀번호 로그인 사용 여부
    ENABLE_REGISTRATION: bool = True  # 회원가입 허용 여부

    # CORS
    FRONTEND_URL: str = "http://localhost:3001"
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
    ]

    # OAuth 설정 (소셜 로그인)
    KAKAO_CLIENT_ID: Optional[str] = None
    KAKAO_CLIENT_SECRET: Optional[str] = None
    KAKAO_REDIRECT_URI: Optional[str] = None

    NAVER_CLIENT_ID: Optional[str] = None
    NAVER_CLIENT_SECRET: Optional[str] = None
    NAVER_REDIRECT_URI: Optional[str] = None

    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GOOGLE_REDIRECT_URI: Optional[str] = None

    # N8N 웹훅
    N8N_WEBHOOK_URL: Optional[str] = None

    # === 본인인증 설정 ===
    # CI 인증 필수 여부 (본인인증)
    REQUIRE_CI_VERIFICATION: bool = True

    # 전화번호 인증 사용 여부 (옵션)
    ENABLE_PHONE_VERIFICATION: bool = False

    # 전화번호 인증 필수 여부 (ENABLE_PHONE_VERIFICATION이 True일 때만)
    REQUIRE_PHONE_VERIFICATION: bool = False

    # 본인인증 서비스 설정 (PASS, 카카오 인증 등)
    IDENTITY_PROVIDER: str = "pass"  # pass, kakao, nice
    IDENTITY_API_KEY: Optional[str] = None
    IDENTITY_API_SECRET: Optional[str] = None

    # === 보안 설정 ===
    # 암호화 키 (AES)
    ENCRYPTION_KEY: Optional[str] = None
    ENCRYPTION_SALT: str = "auction_enc_salt_v1"

    # 해시 솔트
    PHONE_HASH_SALT: str = "auction_phone_salt_v1"
    CI_HASH_SALT: str = "auction_ci_salt_v1"

    # 디바이스 핑거프린트 사용 여부
    ENABLE_DEVICE_FINGERPRINT: bool = True

    # 의심 활동 자동 감지 사용 여부
    ENABLE_SUSPICIOUS_DETECTION: bool = True

    # 같은 디바이스에서 허용되는 최대 계정 수
    MAX_ACCOUNTS_PER_DEVICE: int = 1

    # === 고액 거래 추가 인증 ===
    # 추가 인증이 필요한 금액 (원)
    HIGH_VALUE_THRESHOLD: int = 500000

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """설정 인스턴스 반환 (캐시됨)"""
    return Settings()


settings = get_settings()
