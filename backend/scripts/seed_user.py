"""
테스트 사용자 생성 스크립트
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import bcrypt
from sqlalchemy.orm import Session
from core.database import SessionLocal, init_db
from users.models import User, AuthProvider, UserStatus


def hash_password(password: str) -> str:
    """비밀번호 해시"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def seed_test_user():
    """테스트 사용자 생성"""
    init_db()
    db = SessionLocal()

    try:
        # 테스트 사용자 정보
        test_users = [
            {
                "email": "test@auction.com",
                "password": "test1234",
                "name": "테스트 유저",
                "nickname": "테스터",
            },
            {
                "email": "user@auction.com",
                "password": "user1234",
                "name": "일반 사용자",
                "nickname": "옥션러버",
            },
        ]

        for user_data in test_users:
            # 기존 사용자 확인
            existing = db.query(User).filter(
                User.email == user_data["email"],
                User.provider == AuthProvider.EMAIL.value,
            ).first()

            if existing:
                print(f"이미 존재: {user_data['email']}")
                continue

            # 사용자 생성
            user = User(
                email=user_data["email"],
                password_hash=hash_password(user_data["password"]),
                name=user_data["name"],
                nickname=user_data["nickname"],
                provider=AuthProvider.EMAIL.value,
                status=UserStatus.ACTIVE.value,
                point_balance=10000,  # 테스트용 포인트
            )
            db.add(user)
            db.commit()
            print(f"생성 완료: {user_data['email']} / {user_data['password']}")

        print("\n=== 테스트 계정 ===")
        print("1. test@auction.com / test1234")
        print("2. user@auction.com / user1234")

    finally:
        db.close()


if __name__ == "__main__":
    seed_test_user()
