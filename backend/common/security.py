"""
보안 유틸리티
- 해시, 암호화, 마스킹 등
"""

import hashlib
import secrets
import base64
from typing import Optional
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

from core.config import settings


class SecurityUtils:
    """보안 유틸리티 클래스"""

    # 암호화 키 (환경변수에서 가져오거나 생성)
    _fernet: Optional[Fernet] = None

    @classmethod
    def _get_fernet(cls) -> Fernet:
        """Fernet 암호화 객체 반환"""
        if cls._fernet is None:
            # 환경변수의 시크릿 키로 암호화 키 유도
            secret_key = getattr(settings, 'ENCRYPTION_KEY', settings.SECRET_KEY)
            salt = getattr(settings, 'ENCRYPTION_SALT', b'auction_salt_v1')

            if isinstance(salt, str):
                salt = salt.encode()

            kdf = PBKDF2HMAC(
                algorithm=hashes.SHA256(),
                length=32,
                salt=salt,
                iterations=100000,
            )
            key = base64.urlsafe_b64encode(kdf.derive(secret_key.encode()))
            cls._fernet = Fernet(key)
        return cls._fernet

    @staticmethod
    def hash_phone(phone: str) -> str:
        """
        전화번호 해시 (중복 체크용)
        - 복호화 불가능
        - 같은 번호는 항상 같은 해시
        """
        # 번호 정규화 (하이픈, 공백 제거)
        normalized = phone.replace("-", "").replace(" ", "").strip()

        # 솔트 추가하여 해시 (레인보우 테이블 방지)
        salt = getattr(settings, 'PHONE_HASH_SALT', 'auction_phone_salt')
        salted = f"{salt}:{normalized}"

        return hashlib.sha256(salted.encode()).hexdigest()

    @staticmethod
    def hash_ci(ci: str) -> str:
        """
        CI 해시 (본인인증 고유값)
        - CI는 이미 고유값이지만, 추가 해시로 보안 강화
        """
        salt = getattr(settings, 'CI_HASH_SALT', 'auction_ci_salt')
        salted = f"{salt}:{ci}"
        return hashlib.sha256(salted.encode()).hexdigest()

    @classmethod
    def encrypt(cls, plaintext: str) -> str:
        """
        양방향 암호화 (배송지 등 복호화 필요한 데이터용)
        """
        fernet = cls._get_fernet()
        encrypted = fernet.encrypt(plaintext.encode())
        return base64.urlsafe_b64encode(encrypted).decode()

    @classmethod
    def decrypt(cls, ciphertext: str) -> str:
        """
        복호화
        """
        fernet = cls._get_fernet()
        encrypted = base64.urlsafe_b64decode(ciphertext.encode())
        decrypted = fernet.decrypt(encrypted)
        return decrypted.decode()

    @staticmethod
    def mask_phone(phone: str) -> str:
        """
        전화번호 마스킹 (표시용)
        010-1234-5678 → 010-****-5678
        """
        normalized = phone.replace("-", "").replace(" ", "")
        if len(normalized) >= 8:
            return f"{normalized[:3]}-****-{normalized[-4:]}"
        return "***-****-****"

    @staticmethod
    def mask_email(email: str) -> str:
        """
        이메일 마스킹 (표시용)
        user@example.com → us**@example.com
        """
        if "@" not in email:
            return "****"
        local, domain = email.split("@", 1)
        if len(local) <= 2:
            masked_local = "*" * len(local)
        else:
            masked_local = local[:2] + "*" * (len(local) - 2)
        return f"{masked_local}@{domain}"

    @staticmethod
    def mask_name(name: str) -> str:
        """
        이름 마스킹 (표시용)
        홍길동 → 홍*동
        """
        if len(name) <= 1:
            return "*"
        elif len(name) == 2:
            return name[0] + "*"
        else:
            return name[0] + "*" * (len(name) - 2) + name[-1]

    @staticmethod
    def generate_verification_code(length: int = 6) -> str:
        """
        인증 코드 생성 (SMS 등)
        """
        return "".join(secrets.choice("0123456789") for _ in range(length))

    @staticmethod
    def generate_device_id() -> str:
        """
        디바이스 ID 생성
        """
        return secrets.token_hex(16)
