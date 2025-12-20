"""
카테고리 서비스
"""

from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func

from common.errors import NotFoundException, BadRequestException
from .models import Category
from .schemas import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
    CategoryListResponse,
    CategoryTreeResponse,
)


class CategoryService:
    """카테고리 서비스"""

    def __init__(self, db: Session):
        self.db = db

    def create_category(self, data: CategoryCreate) -> CategoryResponse:
        """카테고리 생성"""
        # 슬러그 중복 확인
        existing = self.db.query(Category).filter(Category.slug == data.slug).first()
        if existing:
            raise BadRequestException(detail="이미 존재하는 슬러그입니다")

        # 부모 카테고리 확인
        if data.parent_id:
            parent = self.db.query(Category).filter(Category.id == data.parent_id).first()
            if not parent:
                raise NotFoundException(detail="부모 카테고리를 찾을 수 없습니다")

        category = Category(
            name=data.name,
            slug=data.slug,
            description=data.description,
            icon=data.icon,
            image_url=data.image_url,
            parent_id=data.parent_id,
            level=data.level,
            sort_order=data.sort_order,
            is_active=data.is_active,
        )

        self.db.add(category)
        self.db.commit()
        self.db.refresh(category)

        return CategoryResponse.model_validate(category)

    def get_category(self, category_id: int) -> CategoryResponse:
        """카테고리 상세 조회"""
        category = self.db.query(Category).filter(Category.id == category_id).first()
        if not category:
            raise NotFoundException(detail="카테고리를 찾을 수 없습니다")
        return CategoryResponse.model_validate(category)

    def get_category_by_slug(self, slug: str) -> CategoryResponse:
        """슬러그로 카테고리 조회"""
        category = self.db.query(Category).filter(Category.slug == slug).first()
        if not category:
            raise NotFoundException(detail="카테고리를 찾을 수 없습니다")
        return CategoryResponse.model_validate(category)

    def get_category_list(
        self,
        parent_id: Optional[int] = None,
        is_active: Optional[bool] = None,
        level: Optional[int] = None,
    ) -> List[CategoryListResponse]:
        """카테고리 목록 조회"""
        query = self.db.query(Category)

        if parent_id is not None:
            query = query.filter(Category.parent_id == parent_id)
        elif parent_id is None and level == 0:
            # 대분류만 조회
            query = query.filter(Category.parent_id == None)

        if is_active is not None:
            query = query.filter(Category.is_active == is_active)

        if level is not None:
            query = query.filter(Category.level == level)

        query = query.order_by(Category.sort_order, Category.name)
        categories = query.all()

        result = []
        for cat in categories:
            # 상품 개수 계산
            from products.models import Product
            product_count = self.db.query(func.count(Product.id)).filter(
                Product.category_id == cat.id
            ).scalar() or 0

            item = CategoryListResponse(
                id=cat.id,
                name=cat.name,
                slug=cat.slug,
                icon=cat.icon,
                parent_id=cat.parent_id,
                level=cat.level,
                sort_order=cat.sort_order,
                is_active=cat.is_active,
                product_count=product_count,
            )
            result.append(item)

        return result

    def get_category_tree(self) -> List[CategoryTreeResponse]:
        """카테고리 트리 조회 (계층 구조)"""
        # 모든 카테고리 조회
        categories = (
            self.db.query(Category)
            .filter(Category.is_active == True)
            .order_by(Category.sort_order, Category.name)
            .all()
        )

        # 트리 구조로 변환
        category_dict = {}
        for cat in categories:
            category_dict[cat.id] = {
                "id": cat.id,
                "name": cat.name,
                "slug": cat.slug,
                "icon": cat.icon,
                "level": cat.level,
                "sort_order": cat.sort_order,
                "is_active": cat.is_active,
                "children": [],
            }

        root = []
        for cat in categories:
            if cat.parent_id is None:
                root.append(category_dict[cat.id])
            else:
                parent = category_dict.get(cat.parent_id)
                if parent:
                    parent["children"].append(category_dict[cat.id])

        return [CategoryTreeResponse(**item) for item in root]

    def update_category(self, category_id: int, data: CategoryUpdate) -> CategoryResponse:
        """카테고리 수정"""
        category = self.db.query(Category).filter(Category.id == category_id).first()
        if not category:
            raise NotFoundException(detail="카테고리를 찾을 수 없습니다")

        # 슬러그 중복 확인 (다른 카테고리)
        if data.slug:
            existing = (
                self.db.query(Category)
                .filter(Category.slug == data.slug, Category.id != category_id)
                .first()
            )
            if existing:
                raise BadRequestException(detail="이미 존재하는 슬러그입니다")

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(category, field, value)

        self.db.commit()
        self.db.refresh(category)

        return CategoryResponse.model_validate(category)

    def delete_category(self, category_id: int) -> bool:
        """카테고리 삭제"""
        category = self.db.query(Category).filter(Category.id == category_id).first()
        if not category:
            raise NotFoundException(detail="카테고리를 찾을 수 없습니다")

        # 자식 카테고리 확인
        children = self.db.query(Category).filter(Category.parent_id == category_id).count()
        if children > 0:
            raise BadRequestException(detail="하위 카테고리가 있어 삭제할 수 없습니다")

        # 연결된 상품 확인
        from products.models import Product
        products = self.db.query(Product).filter(Product.category_id == category_id).count()
        if products > 0:
            raise BadRequestException(detail="연결된 상품이 있어 삭제할 수 없습니다")

        self.db.delete(category)
        self.db.commit()

        return True

    def get_stats(self) -> dict:
        """카테고리 통계"""
        total = self.db.query(Category).count()
        active = self.db.query(Category).filter(Category.is_active == True).count()
        inactive = total - active

        # 레벨별 개수
        level_counts = {}
        for level in range(3):
            count = self.db.query(Category).filter(Category.level == level).count()
            level_counts[f"level_{level}"] = count

        return {
            "total": total,
            "active": active,
            "inactive": inactive,
            **level_counts,
        }
