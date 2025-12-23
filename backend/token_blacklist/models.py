"""
토큰 블랙리스트 SQLAlchemy 모델
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func

from core.database import Base


class TokenBlacklist(Base):
    """로그아웃된 JWT 토큰 블랙리스트"""

    __tablename__ = "token_blacklist"

    id = Column(Integer, primary_key=True, index=True)
    jti = Column(String(64), unique=True, nullable=False, index=True)
    token_type = Column(String(20), nullable=False)  # 'access' | 'refresh'
    user_type = Column(String(20), nullable=False)  # 'admin' | 'user'
    user_id = Column(Integer, nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self) -> str:
        return f"<TokenBlacklist(jti={self.jti}, token_type={self.token_type})>"
