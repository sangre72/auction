"""
인증 서비스
"""

from datetime import datetime, timedelta, timezone
from typing import Optional
from sqlalchemy.orm import Session

from core.config import settings
from core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
)
from common.errors import (
    UnauthorizedException,
    NotFoundException,
    ConflictException,
)
from .models import Admin
from .schemas import (
    LoginRequest,
    LoginResponse,
    AdminCreate,
    AdminResponse,
    PasswordChangeRequest,
)


class AuthService:
    """인증 서비스"""

    def __init__(self, db: Session):
        self.db = db

    def login(self, request: LoginRequest) -> LoginResponse:
        """관리자 로그인"""
        admin = self.db.query(Admin).filter(Admin.email == request.email).first()

        if not admin:
            raise UnauthorizedException(detail="이메일 또는 비밀번호가 올바르지 않습니다")

        if not verify_password(request.password, admin.password_hash):
            raise UnauthorizedException(detail="이메일 또는 비밀번호가 올바르지 않습니다")

        if not admin.is_active:
            raise UnauthorizedException(detail="비활성화된 계정입니다")

        # 마지막 로그인 시간 업데이트
        admin.last_login_at = datetime.now(timezone.utc)
        self.db.commit()

        # 액세스 토큰 생성
        token_data = {
            "sub": str(admin.id),
            "email": admin.email,
            "name": admin.name,
            "role": admin.role,
        }
        access_token = create_access_token(data=token_data)

        return LoginResponse(
            access_token=access_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            admin=AdminResponse.model_validate(admin),
        )

    def create_admin(self, request: AdminCreate) -> AdminResponse:
        """관리자 생성"""
        # 이메일 중복 체크
        existing = self.db.query(Admin).filter(Admin.email == request.email).first()
        if existing:
            raise ConflictException(detail="이미 존재하는 이메일입니다")

        admin = Admin(
            email=request.email,
            password_hash=get_password_hash(request.password),
            name=request.name,
            role=request.role,
        )

        self.db.add(admin)
        self.db.commit()
        self.db.refresh(admin)

        return AdminResponse.model_validate(admin)

    def get_admin(self, admin_id: int) -> AdminResponse:
        """관리자 조회"""
        admin = self.db.query(Admin).filter(Admin.id == admin_id).first()
        if not admin:
            raise NotFoundException(detail="관리자를 찾을 수 없습니다")
        return AdminResponse.model_validate(admin)

    def change_password(
        self,
        admin_id: int,
        request: PasswordChangeRequest,
    ) -> bool:
        """비밀번호 변경"""
        admin = self.db.query(Admin).filter(Admin.id == admin_id).first()
        if not admin:
            raise NotFoundException(detail="관리자를 찾을 수 없습니다")

        if not verify_password(request.current_password, admin.password_hash):
            raise UnauthorizedException(detail="현재 비밀번호가 올바르지 않습니다")

        admin.password_hash = get_password_hash(request.new_password)
        self.db.commit()

        return True

    def get_admin_list(self) -> list[AdminResponse]:
        """관리자 목록 조회"""
        admins = self.db.query(Admin).all()
        return [AdminResponse.model_validate(admin) for admin in admins]
