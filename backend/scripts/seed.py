"""
시드 데이터 생성 스크립트
테스트용 샘플 데이터 삽입
"""

import sys
from pathlib import Path
from datetime import datetime, timezone, timedelta
from decimal import Decimal

# 프로젝트 루트를 path에 추가
sys.path.insert(0, str(Path(__file__).parent.parent))

from core.database import SessionLocal
from core.security import get_password_hash

from auth.models import Admin
from users.models import User, UserStatus, AuthProvider
from products.models import Product, ProductStatus, AuctionType
from banners.models import Banner, BannerPosition, BannerType


def seed_admins(db):
    """관리자 시드 데이터"""
    admins = [
        {
            "email": "admin@auction.com",
            "password_hash": get_password_hash("admin1234"),
            "name": "슈퍼관리자",
            "role": "super_admin",
        },
        {
            "email": "manager@auction.com",
            "password_hash": get_password_hash("manager1234"),
            "name": "일반관리자",
            "role": "admin",
        },
    ]

    for admin_data in admins:
        existing = db.query(Admin).filter(Admin.email == admin_data["email"]).first()
        if not existing:
            admin = Admin(**admin_data)
            db.add(admin)
            print(f"  Created admin: {admin_data['email']}")

    db.commit()


def seed_users(db):
    """사용자 시드 데이터"""
    users = [
        {
            "email": "user1@test.com",
            "name": "테스트유저1",
            "nickname": "테스터1",
            "provider": AuthProvider.EMAIL.value,
            "status": UserStatus.ACTIVE.value,
            "is_verified": True,
            "point_balance": 10000,
        },
        {
            "email": "user2@test.com",
            "name": "테스트유저2",
            "nickname": "테스터2",
            "provider": AuthProvider.KAKAO.value,
            "provider_id": "kakao_12345",
            "status": UserStatus.ACTIVE.value,
            "is_verified": True,
            "point_balance": 5000,
        },
        {
            "email": "user3@test.com",
            "name": "테스트유저3",
            "nickname": "테스터3",
            "provider": AuthProvider.NAVER.value,
            "provider_id": "naver_67890",
            "status": UserStatus.SUSPENDED.value,
            "is_verified": True,
            "point_balance": 0,
        },
    ]

    for user_data in users:
        existing = db.query(User).filter(User.email == user_data["email"]).first()
        if not existing:
            user = User(**user_data)
            db.add(user)
            print(f"  Created user: {user_data['email']}")

    db.commit()


def seed_products(db):
    """상품 시드 데이터"""
    # 먼저 사용자 확인
    seller = db.query(User).first()
    if not seller:
        print("  No users found, skipping products seed")
        return

    products = [
        {
            "seller_id": seller.id,
            "title": "빈티지 시계",
            "description": "1970년대 스위스 빈티지 시계입니다.",
            "category": "시계",
            "auction_type": AuctionType.AUCTION.value,
            "starting_price": Decimal("100000"),
            "current_price": Decimal("150000"),
            "min_bid_increment": Decimal("5000"),
            "status": ProductStatus.ACTIVE.value,
            "bid_count": 5,
            "end_time": datetime.now(timezone.utc) + timedelta(days=7),
        },
        {
            "seller_id": seller.id,
            "title": "명품 가방",
            "description": "새 제품 명품 가방입니다.",
            "category": "가방",
            "auction_type": AuctionType.FIXED_PRICE.value,
            "starting_price": Decimal("500000"),
            "current_price": Decimal("500000"),
            "status": ProductStatus.ACTIVE.value,
        },
        {
            "seller_id": seller.id,
            "title": "골동품 꽃병",
            "description": "조선시대 청자 꽃병입니다.",
            "category": "골동품",
            "auction_type": AuctionType.AUCTION.value,
            "starting_price": Decimal("1000000"),
            "current_price": Decimal("1000000"),
            "min_bid_increment": Decimal("50000"),
            "status": ProductStatus.PENDING.value,
        },
    ]

    for product_data in products:
        existing = db.query(Product).filter(Product.title == product_data["title"]).first()
        if not existing:
            product = Product(**product_data)
            db.add(product)
            print(f"  Created product: {product_data['title']}")

    db.commit()


def seed_banners(db):
    """배너 시드 데이터"""
    banners = [
        {
            "title": "신규 회원 가입 이벤트",
            "description": "신규 가입시 10,000 포인트 지급!",
            "position": BannerPosition.MAIN_TOP.value,
            "type": BannerType.IMAGE.value,
            "image_url": "https://via.placeholder.com/1200x400",
            "link_url": "/event/signup",
            "is_active": True,
            "sort_order": 1,
        },
        {
            "title": "명품 경매 특가",
            "description": "명품 최대 50% 할인",
            "position": BannerPosition.MAIN_TOP.value,
            "type": BannerType.IMAGE.value,
            "image_url": "https://via.placeholder.com/1200x400",
            "link_url": "/products?category=luxury",
            "is_active": True,
            "sort_order": 2,
        },
        {
            "title": "사이드 배너",
            "description": "사이드바 광고",
            "position": BannerPosition.SIDEBAR.value,
            "type": BannerType.IMAGE.value,
            "image_url": "https://via.placeholder.com/300x600",
            "is_active": True,
            "sort_order": 1,
        },
    ]

    for banner_data in banners:
        existing = db.query(Banner).filter(Banner.title == banner_data["title"]).first()
        if not existing:
            banner = Banner(**banner_data)
            db.add(banner)
            print(f"  Created banner: {banner_data['title']}")

    db.commit()


def main():
    """메인 함수"""
    print("=" * 50)
    print("Seeding Database")
    print("=" * 50)

    db = SessionLocal()
    try:
        print("\n[Admins]")
        seed_admins(db)

        print("\n[Users]")
        seed_users(db)

        print("\n[Products]")
        seed_products(db)

        print("\n[Banners]")
        seed_banners(db)

        print("\n" + "=" * 50)
        print("Seeding complete!")
        print("=" * 50)
    finally:
        db.close()


if __name__ == "__main__":
    main()
