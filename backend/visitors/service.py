"""
방문자/통계 서비스
"""

from typing import Optional
from datetime import date, datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func as sql_func

from common.pagination import Pagination, PaginationParams
from .models import Visitor, DailyStats
from .schemas import (
    VisitorResponse,
    VisitorListResponse,
    DailyStatsResponse,
    VisitorSearchParams,
    DashboardSummary,
)


class VisitorService:
    """방문자/통계 서비스"""

    def __init__(self, db: Session):
        self.db = db

    def get_visitor_list(
        self,
        pagination: PaginationParams,
        search: Optional[VisitorSearchParams] = None,
    ) -> Pagination[VisitorListResponse]:
        """방문자 로그 목록 조회"""
        query = self.db.query(Visitor)

        # 검색 조건 적용
        if search:
            if search.ip_address:
                query = query.filter(
                    Visitor.ip_address.ilike(f"%{search.ip_address}%")
                )
            if search.device_type:
                query = query.filter(Visitor.device_type == search.device_type)
            if search.user_id:
                query = query.filter(Visitor.user_id == search.user_id)
            if search.start_date:
                query = query.filter(Visitor.visited_at >= search.start_date)
            if search.end_date:
                query = query.filter(Visitor.visited_at <= search.end_date)

        # 정렬 (최신순)
        query = query.order_by(Visitor.visited_at.desc())

        # 페이지네이션
        result = Pagination.from_query(query, pagination)

        return Pagination(
            items=[VisitorListResponse.model_validate(v) for v in result.items],
            total_count=result.total_count,
            page=result.page,
            page_size=result.page_size,
        )

    def get_daily_stats(
        self,
        start_date: date,
        end_date: date,
    ) -> list[DailyStatsResponse]:
        """일별 통계 조회"""
        stats = (
            self.db.query(DailyStats)
            .filter(
                DailyStats.date >= start_date,
                DailyStats.date <= end_date,
            )
            .order_by(DailyStats.date.asc())
            .all()
        )

        return [DailyStatsResponse.model_validate(s) for s in stats]

    def get_dashboard_summary(self) -> DashboardSummary:
        """대시보드 요약 통계"""
        today = date.today()
        yesterday = today - timedelta(days=1)

        # 오늘 통계
        today_stats = (
            self.db.query(DailyStats).filter(DailyStats.date == today).first()
        )
        yesterday_stats = (
            self.db.query(DailyStats).filter(DailyStats.date == yesterday).first()
        )

        # 기본값 설정
        today_visits = today_stats.total_visits if today_stats else 0
        today_unique = today_stats.unique_visitors if today_stats else 0
        today_signups = today_stats.new_signups if today_stats else 0
        today_revenue = today_stats.total_revenue if today_stats else 0

        yesterday_visits = yesterday_stats.total_visits if yesterday_stats else 0
        yesterday_unique = yesterday_stats.unique_visitors if yesterday_stats else 0
        yesterday_signups = yesterday_stats.new_signups if yesterday_stats else 0
        yesterday_revenue = yesterday_stats.total_revenue if yesterday_stats else 0

        # 변화율 계산
        def calc_change(today_val: int, yesterday_val: int) -> float:
            if yesterday_val == 0:
                return 100.0 if today_val > 0 else 0.0
            return round((today_val - yesterday_val) / yesterday_val * 100, 1)

        # 전체 통계 (다른 모듈에서 가져와야 함, 여기서는 예시)
        # 실제로는 users, products, payments 모듈 연동 필요
        from users.models import User, UserStatus
        from products.models import Product
        from payments.models import Payment, PaymentStatus

        total_users = (
            self.db.query(User)
            .filter(User.status != UserStatus.DELETED.value)
            .count()
        )
        total_products = self.db.query(Product).count()
        total_orders = (
            self.db.query(Payment)
            .filter(Payment.status == PaymentStatus.COMPLETED.value)
            .count()
        )

        return DashboardSummary(
            today_visits=today_visits,
            today_unique_visitors=today_unique,
            today_signups=today_signups,
            today_revenue=today_revenue,
            visits_change=calc_change(today_visits, yesterday_visits),
            visitors_change=calc_change(today_unique, yesterday_unique),
            signups_change=calc_change(today_signups, yesterday_signups),
            revenue_change=calc_change(today_revenue, yesterday_revenue),
            total_users=total_users,
            total_products=total_products,
            total_orders=total_orders,
        )

    def get_visitor_stats(self) -> dict:
        """방문자 통계 요약"""
        today = date.today()

        # 오늘 방문자 수
        today_count = (
            self.db.query(Visitor)
            .filter(sql_func.date(Visitor.visited_at) == today)
            .count()
        )

        # 오늘 고유 방문자 수
        today_unique = (
            self.db.query(sql_func.count(sql_func.distinct(Visitor.session_id)))
            .filter(sql_func.date(Visitor.visited_at) == today)
            .scalar()
            or 0
        )

        # 기기별 통계 (오늘)
        device_stats = (
            self.db.query(
                Visitor.device_type,
                sql_func.count(Visitor.id).label("count"),
            )
            .filter(sql_func.date(Visitor.visited_at) == today)
            .group_by(Visitor.device_type)
            .all()
        )

        devices = {d.device_type: d.count for d in device_stats if d.device_type}

        return {
            "today_visits": today_count,
            "today_unique": today_unique,
            "devices": {
                "desktop": devices.get("desktop", 0),
                "mobile": devices.get("mobile", 0),
                "tablet": devices.get("tablet", 0),
            },
        }
