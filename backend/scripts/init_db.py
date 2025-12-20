"""
데이터베이스 초기화 스크립트
테이블 생성 및 초기 데이터 삽입
"""

import sys
from pathlib import Path

# 프로젝트 루트를 path에 추가
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from core.database import engine, Base, SessionLocal
from core.security import get_password_hash

# 모든 모델 import
from auth.models import Admin
from users.models import User
from categories.models import Category
from products.models import Product, ProductImage, ProductSlot
from payments.models import Payment
from points.models import PointHistory
from banners.models import Banner
from visitors.models import Visitor, DailyStats


def create_tables():
    """테이블 생성"""
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")


def drop_tables():
    """테이블 삭제"""
    print("Dropping tables...")
    Base.metadata.drop_all(bind=engine)
    print("Tables dropped successfully!")


def create_initial_admin():
    """초기 관리자 계정 생성"""
    db = SessionLocal()
    try:
        # 이미 존재하는지 확인
        existing = db.query(Admin).filter(Admin.email == "admin@auction.com").first()
        if existing:
            print("Admin already exists, skipping...")
            return

        admin = Admin(
            email="admin@auction.com",
            password_hash=get_password_hash("admin1234"),
            name="관리자",
            role="super_admin",
            is_active=True,
        )
        db.add(admin)
        db.commit()
        print("Initial admin created: admin@auction.com / admin1234")
    finally:
        db.close()


def check_connection():
    """DB 연결 확인"""
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            print(f"Database connection successful: {result.fetchone()}")
            return True
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False


def main():
    """메인 함수"""
    print("=" * 50)
    print("Database Initialization")
    print("=" * 50)

    # 연결 확인
    if not check_connection():
        print("Failed to connect to database. Please check your settings.")
        sys.exit(1)

    # 테이블 생성
    create_tables()

    # 초기 관리자 생성
    create_initial_admin()

    print("=" * 50)
    print("Initialization complete!")
    print("=" * 50)


if __name__ == "__main__":
    main()
