"""
배너 서비스
"""

from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from common.errors import NotFoundException
from common.pagination import Pagination, PaginationParams
from .models import Banner
from .schemas import (
    BannerCreate,
    BannerUpdate,
    BannerResponse,
    BannerListResponse,
    BannerSearchParams,
    BannerPublicResponse,
)


class BannerService:
    """배너 서비스"""

    def __init__(self, db: Session):
        self.db = db

    def create_banner(self, data: BannerCreate) -> BannerResponse:
        """배너 생성"""
        banner = Banner(**data.model_dump())

        self.db.add(banner)
        self.db.commit()
        self.db.refresh(banner)

        return BannerResponse.model_validate(banner)

    def get_banner(self, banner_id: int) -> BannerResponse:
        """배너 상세 조회"""
        banner = self.db.query(Banner).filter(Banner.id == banner_id).first()
        if not banner:
            raise NotFoundException(detail="배너를 찾을 수 없습니다")
        return BannerResponse.model_validate(banner)

    def get_banner_list(
        self,
        pagination: PaginationParams,
        search: Optional[BannerSearchParams] = None,
    ) -> Pagination[BannerListResponse]:
        """배너 목록 조회"""
        query = self.db.query(Banner)

        # 검색 조건 적용
        if search:
            if search.title:
                query = query.filter(Banner.title.ilike(f"%{search.title}%"))
            if search.position:
                query = query.filter(Banner.position == search.position)
            if search.type:
                query = query.filter(Banner.type == search.type)
            if search.is_active is not None:
                query = query.filter(Banner.is_active == search.is_active)

        # 정렬 (순서 -> 최신순)
        query = query.order_by(Banner.sort_order.asc(), Banner.created_at.desc())

        # 페이지네이션
        result = Pagination.from_query(query, pagination)

        return Pagination(
            items=[BannerListResponse.model_validate(b) for b in result.items],
            total_count=result.total_count,
            page=result.page,
            page_size=result.page_size,
        )

    def update_banner(self, banner_id: int, data: BannerUpdate) -> BannerResponse:
        """배너 수정"""
        banner = self.db.query(Banner).filter(Banner.id == banner_id).first()
        if not banner:
            raise NotFoundException(detail="배너를 찾을 수 없습니다")

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(banner, field, value)

        self.db.commit()
        self.db.refresh(banner)

        return BannerResponse.model_validate(banner)

    def delete_banner(self, banner_id: int) -> bool:
        """배너 삭제"""
        banner = self.db.query(Banner).filter(Banner.id == banner_id).first()
        if not banner:
            raise NotFoundException(detail="배너를 찾을 수 없습니다")

        self.db.delete(banner)
        self.db.commit()

        return True

    def toggle_active(self, banner_id: int) -> BannerResponse:
        """배너 활성화/비활성화 토글"""
        banner = self.db.query(Banner).filter(Banner.id == banner_id).first()
        if not banner:
            raise NotFoundException(detail="배너를 찾을 수 없습니다")

        banner.is_active = not banner.is_active
        self.db.commit()
        self.db.refresh(banner)

        return BannerResponse.model_validate(banner)

    def update_sort_order(self, banner_orders: list[dict]) -> bool:
        """배너 순서 일괄 수정"""
        for item in banner_orders:
            banner_id = item.get("id")
            sort_order = item.get("sort_order")
            if banner_id and sort_order is not None:
                self.db.query(Banner).filter(Banner.id == banner_id).update(
                    {"sort_order": sort_order}
                )

        self.db.commit()
        return True

    def get_banner_stats(self) -> dict:
        """배너 통계"""
        total = self.db.query(Banner).count()
        active = self.db.query(Banner).filter(Banner.is_active == True).count()

        return {
            "total": total,
            "active": active,
            "inactive": total - active,
        }

    # ============================================
    # 공개 API (사용자용)
    # ============================================

    def get_active_banners(self, position: str) -> list[BannerPublicResponse]:
        """활성화된 배너 목록 조회 (사용자용)"""
        now = datetime.now(timezone.utc)

        query = self.db.query(Banner).filter(
            and_(
                Banner.is_active == True,
                Banner.position == position,
                # 시작일 조건: 시작일이 없거나 현재 시간 이후
                (Banner.start_date == None) | (Banner.start_date <= now),
                # 종료일 조건: 종료일이 없거나 현재 시간 이전
                (Banner.end_date == None) | (Banner.end_date >= now),
            )
        ).order_by(Banner.sort_order.asc())

        banners = query.all()
        return [BannerPublicResponse.model_validate(b) for b in banners]

    def record_view(self, banner_id: int) -> bool:
        """배너 조회수 기록"""
        result = self.db.query(Banner).filter(Banner.id == banner_id).update(
            {"view_count": Banner.view_count + 1}
        )
        self.db.commit()
        return result > 0

    def record_click(self, banner_id: int) -> bool:
        """배너 클릭수 기록"""
        result = self.db.query(Banner).filter(Banner.id == banner_id).update(
            {"click_count": Banner.click_count + 1}
        )
        self.db.commit()
        return result > 0

    def get_banner_detail_stats(self) -> list[dict]:
        """배너별 상세 통계"""
        banners = self.db.query(Banner).filter(Banner.is_active == True).all()

        stats = []
        for banner in banners:
            ctr = (banner.click_count / banner.view_count * 100) if banner.view_count > 0 else 0
            stats.append({
                "id": banner.id,
                "title": banner.title,
                "position": banner.position,
                "view_count": banner.view_count,
                "click_count": banner.click_count,
                "ctr": round(ctr, 2),
                "start_date": banner.start_date,
                "end_date": banner.end_date,
            })

        return stats
