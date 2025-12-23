"""
토큰 블랙리스트 관리

로그아웃된 JWT 토큰을 무효화하기 위한 블랙리스트 관리.
DB(PostgreSQL) 또는 Redis를 백엔드로 사용할 수 있음.
"""

from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session

from .config import settings


class TokenBlacklistBase(ABC):
    """토큰 블랙리스트 추상 베이스 클래스"""

    @abstractmethod
    async def add(
        self,
        jti: str,
        expires_at: datetime,
        token_type: str = "access",
        user_type: str = "admin",
        user_id: Optional[int] = None,
    ) -> None:
        """토큰을 블랙리스트에 추가"""
        pass

    @abstractmethod
    async def is_blacklisted(self, jti: str) -> bool:
        """토큰이 블랙리스트에 있는지 확인"""
        pass

    @abstractmethod
    async def cleanup_expired(self) -> int:
        """만료된 토큰 정리"""
        pass


class DBTokenBlacklist(TokenBlacklistBase):
    """PostgreSQL 기반 토큰 블랙리스트"""

    def __init__(self, db: Session):
        self.db = db

    async def add(
        self,
        jti: str,
        expires_at: datetime,
        token_type: str = "access",
        user_type: str = "admin",
        user_id: Optional[int] = None,
    ) -> None:
        """토큰을 블랙리스트에 추가"""
        from token_blacklist.models import TokenBlacklist

        existing = (
            self.db.query(TokenBlacklist).filter(TokenBlacklist.jti == jti).first()
        )
        if existing:
            return

        blacklist_entry = TokenBlacklist(
            jti=jti,
            token_type=token_type,
            user_type=user_type,
            user_id=user_id,
            expires_at=expires_at,
        )
        self.db.add(blacklist_entry)
        self.db.commit()

    async def is_blacklisted(self, jti: str) -> bool:
        """토큰이 블랙리스트에 있는지 확인"""
        from token_blacklist.models import TokenBlacklist

        entry = self.db.query(TokenBlacklist).filter(TokenBlacklist.jti == jti).first()
        if entry is None:
            return False

        if entry.expires_at < datetime.now(timezone.utc):
            self.db.delete(entry)
            self.db.commit()
            return False

        return True

    async def cleanup_expired(self) -> int:
        """만료된 토큰 정리"""
        from token_blacklist.models import TokenBlacklist

        now = datetime.now(timezone.utc)
        result = (
            self.db.query(TokenBlacklist)
            .filter(TokenBlacklist.expires_at < now)
            .delete()
        )
        self.db.commit()
        return result


class RedisTokenBlacklist(TokenBlacklistBase):
    """Redis 기반 토큰 블랙리스트"""

    def __init__(self):
        self._redis = None

    async def _get_redis(self):
        """Redis 연결 획득"""
        if self._redis is None:
            import redis.asyncio as redis

            self._redis = redis.from_url(settings.REDIS_URL, decode_responses=True)
        return self._redis

    async def add(
        self,
        jti: str,
        expires_at: datetime,
        token_type: str = "access",
        user_type: str = "admin",
        user_id: Optional[int] = None,
    ) -> None:
        """토큰을 블랙리스트에 추가 (TTL 사용)"""
        r = await self._get_redis()
        ttl = int((expires_at - datetime.now(timezone.utc)).total_seconds())
        if ttl > 0:
            await r.setex(f"blacklist:{jti}", ttl, f"{token_type}:{user_type}")

    async def is_blacklisted(self, jti: str) -> bool:
        """토큰이 블랙리스트에 있는지 확인"""
        r = await self._get_redis()
        return await r.exists(f"blacklist:{jti}") > 0

    async def cleanup_expired(self) -> int:
        """만료된 토큰 정리 (Redis TTL 자동 처리)"""
        return 0

    async def close(self):
        """연결 종료"""
        if self._redis:
            await self._redis.close()


def get_token_blacklist(db: Optional[Session] = None) -> TokenBlacklistBase:
    """설정에 따라 적절한 블랙리스트 구현체 반환"""
    backend = settings.TOKEN_BLACKLIST_BACKEND.lower()

    if backend == "redis":
        return RedisTokenBlacklist()
    else:
        if db is None:
            raise ValueError("DB 블랙리스트를 사용하려면 db 세션이 필요합니다")
        return DBTokenBlacklist(db)


async def add_token_to_blacklist(
    jti: str,
    expires_at: datetime,
    token_type: str = "access",
    user_type: str = "admin",
    user_id: Optional[int] = None,
    db: Optional[Session] = None,
) -> None:
    """토큰을 블랙리스트에 추가하는 헬퍼 함수"""
    blacklist = get_token_blacklist(db)
    await blacklist.add(
        jti=jti,
        expires_at=expires_at,
        token_type=token_type,
        user_type=user_type,
        user_id=user_id,
    )


async def is_token_blacklisted(jti: str, db: Optional[Session] = None) -> bool:
    """토큰이 블랙리스트에 있는지 확인하는 헬퍼 함수"""
    blacklist = get_token_blacklist(db)
    return await blacklist.is_blacklisted(jti)
