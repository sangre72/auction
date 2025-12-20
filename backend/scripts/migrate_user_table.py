"""
사용자 테이블 마이그레이션 스크립트
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from core.database import SessionLocal, engine


def migrate():
    """사용자 테이블에 필요한 컬럼 추가"""

    # 추가할 컬럼들
    columns_to_add = [
        ("password_hash", "VARCHAR(255)"),
        ("phone_hash", "VARCHAR(64)"),
        ("phone_verified_at", "TIMESTAMP WITH TIME ZONE"),
        ("ci_hash", "VARCHAR(64)"),
        ("ci_verified_at", "TIMESTAMP WITH TIME ZONE"),
        ("verification_level", "VARCHAR(20) DEFAULT 'none'"),
        ("is_verified", "BOOLEAN DEFAULT FALSE"),
        ("status_reason", "VARCHAR(255)"),
        ("point_balance", "INTEGER DEFAULT 0"),
        ("last_login_at", "TIMESTAMP WITH TIME ZONE"),
        # 로그인 시도 제한
        ("failed_login_count", "INTEGER DEFAULT 0"),
        ("locked_at", "TIMESTAMP WITH TIME ZONE"),
    ]

    with engine.connect() as conn:
        for column_name, column_type in columns_to_add:
            try:
                conn.execute(text(f"ALTER TABLE users ADD COLUMN IF NOT EXISTS {column_name} {column_type}"))
                print(f"Added column: {column_name}")
            except Exception as e:
                print(f"Column {column_name} may already exist or error: {e}")

        conn.commit()
        print("\nMigration completed!")


if __name__ == "__main__":
    migrate()
