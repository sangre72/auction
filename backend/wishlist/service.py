"""
관심 상품 서비스
"""

from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional

from .models import Wishlist
from .schemas import WishlistItem
from products.models import Product


class WishlistService:
    """관심 상품 서비스"""

    def __init__(self, db: Session):
        self.db = db

    def get_user_wishlist(
        self,
        user_id: int,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[List[WishlistItem], int]:
        """
        사용자 관심 상품 목록 조회
        """
        query = self.db.query(Wishlist).filter(Wishlist.user_id == user_id)

        total_count = query.count()
        offset = (page - 1) * page_size

        wishlists = query.order_by(desc(Wishlist.created_at)).offset(offset).limit(page_size).all()

        items = []
        for w in wishlists:
            product = self.db.query(Product).filter(Product.id == w.product_id).first()
            if product:
                items.append(
                    WishlistItem(
                        id=w.id,
                        product_id=product.id,
                        product_title=product.title,
                        product_thumbnail=product.thumbnail_url,
                        current_price=float(product.current_price) if product.current_price else None,
                        starting_price=float(product.starting_price),
                        product_status=product.status,
                        bid_count=product.bid_count,
                        slot_count=product.slot_count,
                        sold_slot_count=product.sold_slot_count,
                        end_time=product.end_time,
                        created_at=w.created_at,
                    )
                )

        return items, total_count

    def check_wishlist(self, user_id: int, product_id: int) -> bool:
        """
        관심 상품 여부 확인
        """
        wishlist = self.db.query(Wishlist).filter(
            Wishlist.user_id == user_id,
            Wishlist.product_id == product_id,
        ).first()
        return wishlist is not None

    def add_to_wishlist(self, user_id: int, product_id: int) -> Wishlist:
        """
        관심 상품 추가
        """
        # 이미 등록된 경우 기존 것 반환
        existing = self.db.query(Wishlist).filter(
            Wishlist.user_id == user_id,
            Wishlist.product_id == product_id,
        ).first()

        if existing:
            return existing

        # 상품 존재 확인
        product = self.db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise ValueError("상품을 찾을 수 없습니다")

        wishlist = Wishlist(
            user_id=user_id,
            product_id=product_id,
        )
        self.db.add(wishlist)
        self.db.commit()
        self.db.refresh(wishlist)

        return wishlist

    def remove_from_wishlist(self, user_id: int, product_id: int) -> bool:
        """
        관심 상품 삭제
        """
        wishlist = self.db.query(Wishlist).filter(
            Wishlist.user_id == user_id,
            Wishlist.product_id == product_id,
        ).first()

        if not wishlist:
            return False

        self.db.delete(wishlist)
        self.db.commit()
        return True

    def toggle_wishlist(self, user_id: int, product_id: int) -> tuple[bool, str]:
        """
        관심 상품 토글 (있으면 삭제, 없으면 추가)
        """
        existing = self.db.query(Wishlist).filter(
            Wishlist.user_id == user_id,
            Wishlist.product_id == product_id,
        ).first()

        if existing:
            self.db.delete(existing)
            self.db.commit()
            return False, "관심 상품에서 삭제되었습니다"
        else:
            # 상품 존재 확인
            product = self.db.query(Product).filter(Product.id == product_id).first()
            if not product:
                raise ValueError("상품을 찾을 수 없습니다")

            wishlist = Wishlist(
                user_id=user_id,
                product_id=product_id,
            )
            self.db.add(wishlist)
            self.db.commit()
            return True, "관심 상품에 추가되었습니다"

    def get_wishlist_count(self, user_id: int) -> int:
        """
        관심 상품 개수 조회
        """
        return self.db.query(Wishlist).filter(Wishlist.user_id == user_id).count()

    def get_product_wishlist_count(self, product_id: int) -> int:
        """
        특정 상품을 관심 등록한 사용자 수
        """
        return self.db.query(Wishlist).filter(Wishlist.product_id == product_id).count()
