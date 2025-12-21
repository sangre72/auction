"""
사용자 서비스
"""

from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from common.errors import NotFoundException
from common.pagination import Pagination, PaginationParams
from .models import User, UserStatus
from .schemas import UserResponse, UserListResponse, UserUpdate, UserSearchParams


class UserService:
    """사용자 서비스"""

    def __init__(self, db: Session):
        self.db = db

    def get_user(self, user_id: int) -> UserResponse:
        """사용자 상세 조회"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise NotFoundException(detail="사용자를 찾을 수 없습니다")
        return UserResponse.model_validate(user)

    def get_user_list(
        self,
        pagination: PaginationParams,
        search: Optional[UserSearchParams] = None,
    ) -> Pagination[UserListResponse]:
        """사용자 목록 조회"""
        query = self.db.query(User)

        # 삭제된 사용자 제외
        query = query.filter(User.status != UserStatus.DELETED.value)

        # 검색 조건 적용
        if search:
            if search.email:
                query = query.filter(User.email.ilike(f"%{search.email}%"))
            if search.name:
                query = query.filter(User.name.ilike(f"%{search.name}%"))
            if search.phone:
                query = query.filter(User.phone.ilike(f"%{search.phone}%"))
            if search.provider:
                query = query.filter(User.provider == search.provider)
            if search.status:
                query = query.filter(User.status == search.status)

        # 정렬 (최신순)
        query = query.order_by(User.created_at.desc())

        # 페이지네이션
        result = Pagination.from_query(query, pagination)

        return Pagination(
            items=[UserListResponse.model_validate(u) for u in result.items],
            total_count=result.total_count,
            page=result.page,
            page_size=result.page_size,
        )

    def update_user(self, user_id: int, data: UserUpdate) -> UserResponse:
        """사용자 정보 수정"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise NotFoundException(detail="사용자를 찾을 수 없습니다")

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)

        self.db.commit()
        self.db.refresh(user)

        return UserResponse.model_validate(user)

    def suspend_user(self, user_id: int) -> UserResponse:
        """사용자 정지"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise NotFoundException(detail="사용자를 찾을 수 없습니다")

        user.status = UserStatus.SUSPENDED.value
        self.db.commit()
        self.db.refresh(user)

        return UserResponse.model_validate(user)

    def activate_user(self, user_id: int) -> UserResponse:
        """사용자 활성화"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise NotFoundException(detail="사용자를 찾을 수 없습니다")

        user.status = UserStatus.ACTIVE.value
        self.db.commit()
        self.db.refresh(user)

        return UserResponse.model_validate(user)

    def ban_user(self, user_id: int) -> UserResponse:
        """사용자 영구 정지 (차단)"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise NotFoundException(detail="사용자를 찾을 수 없습니다")

        user.status = UserStatus.BANNED.value
        self.db.commit()
        self.db.refresh(user)

        return UserResponse.model_validate(user)

    def set_inactive(self, user_id: int) -> UserResponse:
        """사용자 휴면 처리"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise NotFoundException(detail="사용자를 찾을 수 없습니다")

        user.status = UserStatus.INACTIVE.value
        self.db.commit()
        self.db.refresh(user)

        return UserResponse.model_validate(user)

    def delete_user(self, user_id: int) -> bool:
        """사용자 삭제 (소프트 삭제)"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise NotFoundException(detail="사용자를 찾을 수 없습니다")

        user.status = UserStatus.DELETED.value
        self.db.commit()

        return True

    def get_user_count(self) -> dict:
        """사용자 통계"""
        total = self.db.query(User).filter(
            User.status != UserStatus.DELETED.value
        ).count()
        active = self.db.query(User).filter(
            User.status == UserStatus.ACTIVE.value
        ).count()
        inactive = self.db.query(User).filter(
            User.status == UserStatus.INACTIVE.value
        ).count()
        suspended = self.db.query(User).filter(
            User.status == UserStatus.SUSPENDED.value
        ).count()
        banned = self.db.query(User).filter(
            User.status == UserStatus.BANNED.value
        ).count()

        return {
            "total": total,
            "active": active,
            "inactive": inactive,
            "suspended": suspended,
            "banned": banned,
        }
