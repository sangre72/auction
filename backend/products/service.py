"""
상품 서비스
"""

from typing import Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from common.errors import NotFoundException, BadRequestException
from common.pagination import Pagination, PaginationParams
from .models import Product, ProductSlot, ProductStatus, SlotStatus
from .schemas import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductListResponse,
    ProductSearchParams,
    SlotResponse,
    SlotListResponse,
    SlotPurchaseRequest,
    SlotUpdateRequest,
    SlotSearchParams,
)


class ProductService:
    """상품 서비스"""

    def __init__(self, db: Session):
        self.db = db

    def create_product(self, data: ProductCreate) -> ProductResponse:
        """상품 생성 + 슬롯 자동 생성"""
        # 카테고리 ID가 있으면 유효성 검증
        if data.category_id:
            from categories.models import Category
            category = self.db.query(Category).filter(Category.id == data.category_id).first()
            if not category:
                raise BadRequestException(detail="존재하지 않는 카테고리입니다")

        product = Product(
            seller_id=data.seller_id,
            title=data.title,
            description=data.description,
            category=data.category,
            category_id=data.category_id,
            auction_type=data.auction_type,
            starting_price=data.starting_price,
            current_price=data.starting_price,
            buy_now_price=data.buy_now_price,
            min_bid_increment=data.min_bid_increment,
            slot_price=data.slot_price,
            slot_count=data.slot_count,
            start_time=data.start_time,
            end_time=data.end_time,
            thumbnail_url=data.thumbnail_url,
            status=ProductStatus.DRAFT.value,
        )

        self.db.add(product)
        self.db.flush()  # product.id를 얻기 위해 flush

        # 슬롯 자동 생성
        self._create_slots(product.id, data.slot_count)

        self.db.commit()
        self.db.refresh(product)

        return ProductResponse.model_validate(product)

    def _create_slots(self, product_id: int, slot_count: int) -> None:
        """슬롯 생성 (내부 함수)"""
        slots = [
            ProductSlot(
                product_id=product_id,
                slot_number=i,
                status=SlotStatus.AVAILABLE.value,
            )
            for i in range(1, slot_count + 1)
        ]
        self.db.bulk_save_objects(slots)

    def get_product(self, product_id: int) -> ProductResponse:
        """상품 상세 조회"""
        product = self.db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise NotFoundException(detail="상품을 찾을 수 없습니다")

        # 카테고리명 조회
        category_name = None
        if product.category_id:
            category_name = product.category_rel.name if product.category_rel else None

        response = ProductResponse.model_validate(product)
        response.category_name = category_name
        return response

    def get_product_list(
        self,
        pagination: PaginationParams,
        search: Optional[ProductSearchParams] = None,
    ) -> Pagination[ProductListResponse]:
        """상품 목록 조회"""
        query = self.db.query(Product)

        # 검색 조건 적용
        if search:
            if search.title:
                query = query.filter(Product.title.ilike(f"%{search.title}%"))
            if search.category:
                query = query.filter(Product.category == search.category)
            if search.category_id:
                query = query.filter(Product.category_id == search.category_id)
            if search.status:
                query = query.filter(Product.status == search.status)
            if search.auction_type:
                query = query.filter(Product.auction_type == search.auction_type)
            if search.is_featured is not None:
                query = query.filter(Product.is_featured == search.is_featured)
            if search.seller_id:
                query = query.filter(Product.seller_id == search.seller_id)

        # 정렬 (최신순)
        query = query.order_by(Product.created_at.desc())

        # 페이지네이션
        result = Pagination.from_query(query, pagination)

        # 카테고리명 포함한 응답 생성
        items = []
        for p in result.items:
            item = ProductListResponse.model_validate(p)
            if p.category_id and p.category_rel:
                item.category_name = p.category_rel.name
            items.append(item)

        return Pagination(
            items=items,
            total_count=result.total_count,
            page=result.page,
            page_size=result.page_size,
        )

    def update_product(self, product_id: int, data: ProductUpdate) -> ProductResponse:
        """상품 수정"""
        product = self.db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise NotFoundException(detail="상품을 찾을 수 없습니다")

        # 카테고리 ID 변경 시 유효성 검증
        if data.category_id is not None:
            from categories.models import Category
            category = self.db.query(Category).filter(Category.id == data.category_id).first()
            if not category:
                raise BadRequestException(detail="존재하지 않는 카테고리입니다")

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(product, field, value)

        self.db.commit()
        self.db.refresh(product)

        # 카테고리명 포함 응답
        category_name = None
        if product.category_id and product.category_rel:
            category_name = product.category_rel.name

        response = ProductResponse.model_validate(product)
        response.category_name = category_name
        return response

    def delete_product(self, product_id: int) -> bool:
        """상품 삭제"""
        product = self.db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise NotFoundException(detail="상품을 찾을 수 없습니다")

        if product.status == ProductStatus.ACTIVE.value:
            raise BadRequestException(detail="활성 상태의 상품은 삭제할 수 없습니다")

        self.db.delete(product)
        self.db.commit()

        return True

    def approve_product(self, product_id: int) -> ProductResponse:
        """상품 승인"""
        product = self.db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise NotFoundException(detail="상품을 찾을 수 없습니다")

        if product.status != ProductStatus.PENDING.value:
            raise BadRequestException(detail="검토 대기 상태의 상품만 승인할 수 있습니다")

        product.status = ProductStatus.ACTIVE.value
        self.db.commit()
        self.db.refresh(product)

        return ProductResponse.model_validate(product)

    def reject_product(self, product_id: int) -> ProductResponse:
        """상품 반려"""
        product = self.db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise NotFoundException(detail="상품을 찾을 수 없습니다")

        product.status = ProductStatus.CANCELLED.value
        self.db.commit()
        self.db.refresh(product)

        return ProductResponse.model_validate(product)

    def set_featured(self, product_id: int, is_featured: bool) -> ProductResponse:
        """추천 상품 설정"""
        product = self.db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise NotFoundException(detail="상품을 찾을 수 없습니다")

        product.is_featured = is_featured
        self.db.commit()
        self.db.refresh(product)

        return ProductResponse.model_validate(product)

    def get_product_stats(self) -> dict:
        """상품 통계"""
        total = self.db.query(Product).count()
        active = self.db.query(Product).filter(
            Product.status == ProductStatus.ACTIVE.value
        ).count()
        pending = self.db.query(Product).filter(
            Product.status == ProductStatus.PENDING.value
        ).count()
        sold = self.db.query(Product).filter(
            Product.status == ProductStatus.SOLD.value
        ).count()

        return {
            "total": total,
            "active": active,
            "pending": pending,
            "sold": sold,
        }

    # ============================================
    # 슬롯 관련 메서드
    # ============================================

    def get_product_slots(self, product_id: int) -> list[SlotListResponse]:
        """상품의 모든 슬롯 조회"""
        product = self.db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise NotFoundException(detail="상품을 찾을 수 없습니다")

        slots = (
            self.db.query(ProductSlot)
            .filter(ProductSlot.product_id == product_id)
            .order_by(ProductSlot.slot_number)
            .all()
        )

        return [SlotListResponse.model_validate(s) for s in slots]

    def get_slot(self, slot_id: int) -> SlotResponse:
        """슬롯 상세 조회"""
        slot = self.db.query(ProductSlot).filter(ProductSlot.id == slot_id).first()
        if not slot:
            raise NotFoundException(detail="슬롯을 찾을 수 없습니다")
        return SlotResponse.model_validate(slot)

    def purchase_slots(self, product_id: int, request: SlotPurchaseRequest) -> list[SlotResponse]:
        """슬롯 구매 (예약)"""
        product = self.db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise NotFoundException(detail="상품을 찾을 수 없습니다")

        if product.status != ProductStatus.ACTIVE.value:
            raise BadRequestException(detail="판매 중인 상품만 구매할 수 있습니다")

        # 요청한 슬롯들 조회
        slots = (
            self.db.query(ProductSlot)
            .filter(
                ProductSlot.product_id == product_id,
                ProductSlot.slot_number.in_(request.slot_numbers),
            )
            .all()
        )

        if len(slots) != len(request.slot_numbers):
            raise BadRequestException(detail="존재하지 않는 슬롯 번호가 포함되어 있습니다")

        # 구매 가능 여부 확인
        for slot in slots:
            if slot.status != SlotStatus.AVAILABLE.value:
                raise BadRequestException(
                    detail=f"슬롯 {slot.slot_number}번은 이미 판매되었거나 예약 중입니다"
                )

        # 슬롯 예약 처리
        now = datetime.now(timezone.utc)
        for slot in slots:
            slot.buyer_id = request.buyer_id
            slot.status = SlotStatus.RESERVED.value
            slot.reserved_at = now
            slot.buyer_note = request.buyer_note
            slot.paid_price = product.slot_price

        self.db.commit()

        # 슬롯 새로고침 및 반환
        result = []
        for slot in slots:
            self.db.refresh(slot)
            result.append(SlotResponse.model_validate(slot))

        return result

    def confirm_slot_purchase(self, slot_id: int, payment_id: int) -> SlotResponse:
        """슬롯 구매 확정 (결제 완료)"""
        slot = self.db.query(ProductSlot).filter(ProductSlot.id == slot_id).first()
        if not slot:
            raise NotFoundException(detail="슬롯을 찾을 수 없습니다")

        if slot.status != SlotStatus.RESERVED.value:
            raise BadRequestException(detail="예약 상태의 슬롯만 구매 확정할 수 있습니다")

        slot.status = SlotStatus.SOLD.value
        slot.payment_id = payment_id
        slot.purchased_at = datetime.now(timezone.utc)

        # 상품의 판매 슬롯 수 업데이트
        product = self.db.query(Product).filter(Product.id == slot.product_id).first()
        product.sold_slot_count += 1

        # 모든 슬롯이 판매되면 상품 상태 변경
        if product.sold_slot_count >= product.slot_count:
            product.status = ProductStatus.SOLD.value

        self.db.commit()
        self.db.refresh(slot)

        return SlotResponse.model_validate(slot)

    def cancel_slot(self, slot_id: int, admin_note: Optional[str] = None) -> SlotResponse:
        """슬롯 취소 (관리자)"""
        slot = self.db.query(ProductSlot).filter(ProductSlot.id == slot_id).first()
        if not slot:
            raise NotFoundException(detail="슬롯을 찾을 수 없습니다")

        was_sold = slot.status == SlotStatus.SOLD.value

        slot.status = SlotStatus.CANCELLED.value
        slot.cancelled_at = datetime.now(timezone.utc)
        if admin_note:
            slot.admin_note = admin_note

        # 판매된 슬롯이었으면 카운트 감소
        if was_sold:
            product = self.db.query(Product).filter(Product.id == slot.product_id).first()
            product.sold_slot_count = max(0, product.sold_slot_count - 1)
            if product.status == ProductStatus.SOLD.value:
                product.status = ProductStatus.ACTIVE.value

        self.db.commit()
        self.db.refresh(slot)

        return SlotResponse.model_validate(slot)

    def reset_slot(self, slot_id: int) -> SlotResponse:
        """슬롯 초기화 (다시 구매 가능하게)"""
        slot = self.db.query(ProductSlot).filter(ProductSlot.id == slot_id).first()
        if not slot:
            raise NotFoundException(detail="슬롯을 찾을 수 없습니다")

        was_sold = slot.status == SlotStatus.SOLD.value

        slot.buyer_id = None
        slot.status = SlotStatus.AVAILABLE.value
        slot.payment_id = None
        slot.paid_price = None
        slot.reserved_at = None
        slot.purchased_at = None
        slot.cancelled_at = None
        slot.buyer_note = None

        if was_sold:
            product = self.db.query(Product).filter(Product.id == slot.product_id).first()
            product.sold_slot_count = max(0, product.sold_slot_count - 1)
            if product.status == ProductStatus.SOLD.value:
                product.status = ProductStatus.ACTIVE.value

        self.db.commit()
        self.db.refresh(slot)

        return SlotResponse.model_validate(slot)

    def update_slot(self, slot_id: int, data: SlotUpdateRequest) -> SlotResponse:
        """슬롯 정보 수정 (관리자)"""
        slot = self.db.query(ProductSlot).filter(ProductSlot.id == slot_id).first()
        if not slot:
            raise NotFoundException(detail="슬롯을 찾을 수 없습니다")

        if data.status:
            slot.status = data.status
        if data.admin_note:
            slot.admin_note = data.admin_note

        self.db.commit()
        self.db.refresh(slot)

        return SlotResponse.model_validate(slot)

    def get_slot_stats(self, product_id: int) -> dict:
        """상품 슬롯 통계"""
        product = self.db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise NotFoundException(detail="상품을 찾을 수 없습니다")

        available = (
            self.db.query(ProductSlot)
            .filter(
                ProductSlot.product_id == product_id,
                ProductSlot.status == SlotStatus.AVAILABLE.value,
            )
            .count()
        )
        reserved = (
            self.db.query(ProductSlot)
            .filter(
                ProductSlot.product_id == product_id,
                ProductSlot.status == SlotStatus.RESERVED.value,
            )
            .count()
        )
        sold = (
            self.db.query(ProductSlot)
            .filter(
                ProductSlot.product_id == product_id,
                ProductSlot.status == SlotStatus.SOLD.value,
            )
            .count()
        )
        cancelled = (
            self.db.query(ProductSlot)
            .filter(
                ProductSlot.product_id == product_id,
                ProductSlot.status == SlotStatus.CANCELLED.value,
            )
            .count()
        )

        return {
            "total": product.slot_count,
            "available": available,
            "reserved": reserved,
            "sold": sold,
            "cancelled": cancelled,
        }
