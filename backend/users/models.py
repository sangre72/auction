"""
사용자 모델
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, Text, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from core.database import Base


class UserStatus(str, enum.Enum):
    """사용자 상태"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"  # 일시 정지
    BANNED = "banned"        # 영구 정지
    DELETED = "deleted"


class AuthProvider(str, enum.Enum):
    """인증 제공자"""
    EMAIL = "email"
    KAKAO = "kakao"
    NAVER = "naver"
    GOOGLE = "google"
    APPLE = "apple"
    FACEBOOK = "facebook"
    TWITTER = "twitter"
    LINE = "line"
    GITHUB = "github"


class VerificationLevel(str, enum.Enum):
    """본인인증 레벨"""
    NONE = "none"           # 미인증
    PHONE = "phone"         # 전화번호 인증
    CI = "ci"               # 본인인증 (CI)


class User(Base):
    """사용자 테이블"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    # === 기본 정보 ===
    email = Column(String(255), index=True, nullable=True)
    name = Column(String(100), nullable=True)
    nickname = Column(String(100), nullable=True)
    profile_image = Column(String(500), nullable=True)

    # === 인증 정보 ===
    password_hash = Column(String(255), nullable=True)  # 이메일 로그인용 비밀번호

    # === 소셜 로그인 ===
    provider = Column(String(20), default=AuthProvider.EMAIL.value, index=True)
    provider_id = Column(String(255), nullable=True, index=True)

    # === 본인 확인 (보안 핵심) ===
    # 전화번호: 해시만 저장 (원본 저장 안 함)
    phone_hash = Column(String(64), unique=True, index=True, nullable=True)
    phone_verified_at = Column(DateTime(timezone=True), nullable=True)

    # 본인인증 CI: 해시로 저장
    ci_hash = Column(String(64), unique=True, index=True, nullable=True)
    ci_verified_at = Column(DateTime(timezone=True), nullable=True)

    # 인증 레벨
    verification_level = Column(
        String(20),
        default=VerificationLevel.NONE.value,
        index=True
    )

    # === 상태 ===
    status = Column(String(20), default=UserStatus.ACTIVE.value, index=True)
    is_verified = Column(Boolean, default=False)
    status_reason = Column(String(255), nullable=True)  # 정지 사유 등

    # === 로그인 시도 제한 ===
    failed_login_count = Column(Integer, default=0)  # 연속 로그인 실패 횟수
    locked_at = Column(DateTime(timezone=True), nullable=True)  # 계정 잠금 시간

    # === 포인트 ===
    point_balance = Column(Integer, default=0)

    # === 타임스탬프 ===
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # === 관계 ===
    devices = relationship("UserDevice", back_populates="user", cascade="all, delete-orphan")
    shipping_addresses = relationship("ShippingAddress", back_populates="user", cascade="all, delete-orphan")


class UserDevice(Base):
    """
    사용자 디바이스 (핑거프린트 추적)
    - 같은 디바이스에서 여러 계정 사용 감지
    """
    __tablename__ = "user_devices"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # 디바이스 식별
    device_id = Column(String(64), index=True)           # 생성된 디바이스 ID
    fingerprint_hash = Column(String(64), index=True)    # 브라우저/디바이스 핑거프린트 해시

    # 디바이스 정보 (분석용, 암호화 안 함)
    user_agent = Column(String(500), nullable=True)
    platform = Column(String(50), nullable=True)         # web, ios, android
    browser = Column(String(50), nullable=True)

    # IP 정보
    ip_address = Column(String(45), nullable=True)       # IPv6 대응
    ip_country = Column(String(10), nullable=True)

    # 상태
    is_trusted = Column(Boolean, default=False)          # 신뢰된 디바이스
    last_used_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 관계
    user = relationship("User", back_populates="devices")


class ShippingAddress(Base):
    """
    배송지 정보 (암호화 저장)
    - 개인정보 분리 저장
    """
    __tablename__ = "shipping_addresses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # 별칭 (암호화 안 함)
    alias = Column(String(50), nullable=True)            # "집", "회사" 등
    is_default = Column(Boolean, default=False)

    # 암호화된 개인정보
    recipient_name_enc = Column(Text, nullable=False)    # 수령인 이름 (암호화)
    phone_enc = Column(Text, nullable=False)             # 연락처 (암호화)
    zipcode_enc = Column(Text, nullable=False)           # 우편번호 (암호화)
    address1_enc = Column(Text, nullable=False)          # 기본주소 (암호화)
    address2_enc = Column(Text, nullable=True)           # 상세주소 (암호화)

    # 메타데이터 (암호화 안 함)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # 관계
    user = relationship("User", back_populates="shipping_addresses")


class SuspiciousActivity(Base):
    """
    의심스러운 활동 로그
    - 다중 계정 의심 감지용
    """
    __tablename__ = "suspicious_activities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    # 활동 유형
    activity_type = Column(String(50), index=True)  # duplicate_device, same_ip_multi_account, etc.
    severity = Column(String(20), default="low")    # low, medium, high, critical

    # 상세 정보
    details = Column(JSON, nullable=True)           # 상세 데이터 (JSON)
    related_user_ids = Column(JSON, nullable=True)  # 연관된 다른 사용자 IDs

    # 처리 상태
    is_reviewed = Column(Boolean, default=False)
    reviewed_by = Column(Integer, nullable=True)    # 검토한 관리자 ID
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    action_taken = Column(String(50), nullable=True)  # ignored, warned, suspended, banned

    created_at = Column(DateTime(timezone=True), server_default=func.now())
