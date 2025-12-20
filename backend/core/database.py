"""
데이터베이스 설정
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from .config import settings

# 데이터베이스 연결
if settings.DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        settings.DATABASE_URL,
        connect_args={"check_same_thread": False},  # SQLite 멀티스레드 지원
    )
else:
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,  # 연결 상태 확인
        pool_size=10,
        max_overflow=20,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """데이터베이스 세션 의존성"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """데이터베이스 초기화 (테이블 생성)"""
    # 모든 모델 import (테이블 생성을 위해 필요)
    from auth.models import Admin
    from users.models import User
    from categories.models import Category
    from products.models import Product, ProductImage, ProductSlot
    from payments.models import Payment
    from points.models import PointHistory
    from banners.models import Banner
    from visitors.models import Visitor, DailyStats

    Base.metadata.create_all(bind=engine)
