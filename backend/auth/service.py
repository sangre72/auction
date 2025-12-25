"""
인증 서비스

플러그인 아키텍처를 지원하는 인증 서비스
다른 프로젝트에서 설정과 사용자 모델을 주입하여 재사용 가능

Example:
    # 기본 사용 (Admin 모델, 기본 설정)
    service = AuthService(db)

    # 커스텀 설정
    from core.auth_config import AuthPluginConfig
    custom_config = AuthPluginConfig(access_token_expire_minutes=60)
    service = AuthService(db, config=custom_config)

    # 다른 사용자 모델 사용
    service = AuthService(db, user_model=MyUserModel)
"""

from datetime import datetime, timedelta, timezone
from typing import Optional, Type, Any
from sqlalchemy.orm import Session

from core.config import settings
from core.auth_config import AuthPluginConfig, auth_plugin_config
from core.security import (
    get_password_hash,
    verify_password,
    create_token_pair,
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
    """
    인증 서비스

    플러그인 아키텍처:
    - config: 인증 설정 (토큰 만료, 쿠키 이름 등)
    - user_model: 사용자 모델 (기본: Admin)
    """

    def __init__(
        self,
        db: Session,
        config: Optional[AuthPluginConfig] = None,
        user_model: Optional[Type[Any]] = None,
    ):
        self.db = db
        self.config = config or auth_plugin_config
        self.user_model = user_model or Admin

    def login(self, request: LoginRequest) -> LoginResponse:
        """관리자 로그인"""
        # 사용자 모델 조회 (플러그인: 다른 모델로 교체 가능)
        user = self.db.query(self.user_model).filter(
            self.user_model.email == request.email
        ).first()

        if not user:
            raise UnauthorizedException(detail="이메일 또는 비밀번호가 올바르지 않습니다")

        if not verify_password(request.password, user.password_hash):
            raise UnauthorizedException(detail="이메일 또는 비밀번호가 올바르지 않습니다")

        if not user.is_active:
            raise UnauthorizedException(detail="비활성화된 계정입니다")

        # 마지막 로그인 시간 업데이트
        user.last_login_at = datetime.now(timezone.utc)
        self.db.commit()

        # 토큰 쌍 생성 (Access + Refresh)
        token_data = {
            "sub": str(user.id),
            "email": user.email,
            "name": user.name,
            "role": getattr(user, "role", "user"),  # role이 없는 모델 지원
        }
        access_token, refresh_token = create_token_pair(data=token_data, token_type="admin")

        # 플러그인 설정 사용
        return LoginResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=self.config.access_token_expire_minutes * 60,
            refresh_expires_in=self.config.refresh_token_expire_days * 24 * 60 * 60,
            admin=AdminResponse.model_validate(user),
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
