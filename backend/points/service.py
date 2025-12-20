"""
포인트 서비스
"""

from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func as sql_func

from common.errors import NotFoundException, BadRequestException
from common.pagination import Pagination, PaginationParams
from users.models import User
from .models import PointHistory, PointType, PointReason
from .schemas import (
    PointHistoryResponse,
    PointHistoryListResponse,
    PointAdjustRequest,
    PointSearchParams,
    UserPointSummary,
)


class PointService:
    """포인트 서비스"""

    def __init__(self, db: Session):
        self.db = db

    def get_user_point_summary(self, user_id: int) -> UserPointSummary:
        """사용자 포인트 요약"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise NotFoundException(detail="사용자를 찾을 수 없습니다")

        total_earned = (
            self.db.query(sql_func.sum(PointHistory.amount))
            .filter(
                PointHistory.user_id == user_id,
                PointHistory.amount > 0,
            )
            .scalar()
            or 0
        )

        total_used = abs(
            self.db.query(sql_func.sum(PointHistory.amount))
            .filter(
                PointHistory.user_id == user_id,
                PointHistory.type == PointType.USE.value,
            )
            .scalar()
            or 0
        )

        total_expired = abs(
            self.db.query(sql_func.sum(PointHistory.amount))
            .filter(
                PointHistory.user_id == user_id,
                PointHistory.type == PointType.EXPIRE.value,
            )
            .scalar()
            or 0
        )

        return UserPointSummary(
            user_id=user_id,
            balance=user.point_balance,
            total_earned=total_earned,
            total_used=total_used,
            total_expired=total_expired,
        )

    def get_point_history_list(
        self,
        pagination: PaginationParams,
        search: Optional[PointSearchParams] = None,
    ) -> Pagination[PointHistoryListResponse]:
        """포인트 이력 목록 조회"""
        query = self.db.query(PointHistory)

        # 검색 조건 적용
        if search:
            if search.user_id:
                query = query.filter(PointHistory.user_id == search.user_id)
            if search.type:
                query = query.filter(PointHistory.type == search.type)
            if search.reason:
                query = query.filter(PointHistory.reason == search.reason)
            if search.start_date:
                query = query.filter(PointHistory.created_at >= search.start_date)
            if search.end_date:
                query = query.filter(PointHistory.created_at <= search.end_date)

        # 정렬 (최신순)
        query = query.order_by(PointHistory.created_at.desc())

        # 페이지네이션
        result = Pagination.from_query(query, pagination)

        return Pagination(
            items=[PointHistoryListResponse.model_validate(p) for p in result.items],
            total_count=result.total_count,
            page=result.page,
            page_size=result.page_size,
        )

    def adjust_points(
        self,
        request: PointAdjustRequest,
        admin_id: int,
    ) -> PointHistoryResponse:
        """포인트 조정 (관리자)"""
        user = self.db.query(User).filter(User.id == request.user_id).first()
        if not user:
            raise NotFoundException(detail="사용자를 찾을 수 없습니다")

        # 차감 시 잔액 확인
        if request.amount < 0 and user.point_balance + request.amount < 0:
            raise BadRequestException(detail="포인트 잔액이 부족합니다")

        # 포인트 타입 결정
        point_type = (
            PointType.ADMIN_ADD.value
            if request.amount > 0
            else PointType.ADMIN_DEDUCT.value
        )

        # 잔액 업데이트
        new_balance = user.point_balance + request.amount
        user.point_balance = new_balance

        # 이력 생성
        history = PointHistory(
            user_id=request.user_id,
            type=point_type,
            reason=request.reason,
            amount=request.amount,
            balance=new_balance,
            description=request.description,
            admin_id=admin_id,
        )

        self.db.add(history)
        self.db.commit()
        self.db.refresh(history)

        return PointHistoryResponse.model_validate(history)

    def get_point_stats(self) -> dict:
        """포인트 통계"""
        total_points = (
            self.db.query(sql_func.sum(User.point_balance)).scalar() or 0
        )

        total_earned = (
            self.db.query(sql_func.sum(PointHistory.amount))
            .filter(PointHistory.amount > 0)
            .scalar()
            or 0
        )

        total_used = abs(
            self.db.query(sql_func.sum(PointHistory.amount))
            .filter(PointHistory.type == PointType.USE.value)
            .scalar()
            or 0
        )

        return {
            "total_circulation": total_points,
            "total_earned": total_earned,
            "total_used": total_used,
        }
