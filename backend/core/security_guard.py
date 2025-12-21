"""
보안 미들웨어 설정
- IP 차단/허용
- Rate Limiting
- 공격 패턴 감지 (SQL Injection, XSS 등)
- 자동 IP 차단
- 관리자 API 지원
"""

import logging
from typing import Optional
from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from datetime import datetime, timedelta
from collections import defaultdict
from dataclasses import dataclass, field, asdict
from enum import Enum
import re

logger = logging.getLogger(__name__)


class BanType(str, Enum):
    """차단 유형"""
    AUTO = "auto"  # 자동 차단
    MANUAL = "manual"  # 수동 차단
    BLACKLIST = "blacklist"  # 블랙리스트


@dataclass
class BannedIPInfo:
    """차단된 IP 정보"""
    ip: str
    ban_type: BanType
    reason: str
    banned_at: datetime
    ban_until: Optional[datetime] = None  # None이면 영구 차단
    suspicious_count: int = 0
    last_attack_type: Optional[str] = None

    def to_dict(self) -> dict:
        """딕셔너리로 변환"""
        return {
            "ip": self.ip,
            "ban_type": self.ban_type.value,
            "reason": self.reason,
            "banned_at": self.banned_at.isoformat(),
            "ban_until": self.ban_until.isoformat() if self.ban_until else None,
            "is_permanent": self.ban_until is None,
            "remaining_seconds": self.get_remaining_seconds(),
            "suspicious_count": self.suspicious_count,
            "last_attack_type": self.last_attack_type,
        }

    def get_remaining_seconds(self) -> Optional[int]:
        """남은 차단 시간 (초)"""
        if self.ban_until is None:
            return None
        remaining = (self.ban_until - datetime.now()).total_seconds()
        return max(0, int(remaining))

    def is_expired(self) -> bool:
        """차단 만료 여부"""
        if self.ban_until is None:
            return False  # 영구 차단
        return datetime.now() >= self.ban_until


@dataclass
class SuspiciousActivity:
    """의심 활동 기록"""
    ip: str
    count: int = 0
    first_seen: Optional[datetime] = None
    last_seen: Optional[datetime] = None
    attack_types: list = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "ip": self.ip,
            "count": self.count,
            "first_seen": self.first_seen.isoformat() if self.first_seen else None,
            "last_seen": self.last_seen.isoformat() if self.last_seen else None,
            "attack_types": self.attack_types,
        }


class SecurityConfig:
    """보안 설정"""

    def __init__(
        self,
        # Rate Limiting
        rate_limit: int = 100,  # 분당 최대 요청 수
        rate_limit_window: int = 60,  # 초 단위 윈도우

        # 자동 차단
        auto_ban_threshold: int = 10,  # 의심 요청 횟수 임계값
        auto_ban_duration: int = 3600,  # 차단 지속 시간 (초)

        # IP 목록
        whitelist: Optional[list[str]] = None,
        blacklist: Optional[list[str]] = None,

        # 기능 활성화
        enable_rate_limit: bool = True,
        enable_penetration_detection: bool = True,
        enable_auto_ban: bool = True,

        # 제외 경로
        excluded_paths: Optional[list[str]] = None,
    ):
        self.rate_limit = rate_limit
        self.rate_limit_window = rate_limit_window
        self.auto_ban_threshold = auto_ban_threshold
        self.auto_ban_duration = auto_ban_duration
        self.whitelist = whitelist or []
        self.blacklist = blacklist or []
        self.enable_rate_limit = enable_rate_limit
        self.enable_penetration_detection = enable_penetration_detection
        self.enable_auto_ban = enable_auto_ban
        self.excluded_paths = excluded_paths or ["/docs", "/redoc", "/openapi.json", "/health"]


# 공격 패턴 정규식
ATTACK_PATTERNS = {
    "sql_injection": [
        r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b.*\b(FROM|INTO|TABLE|DATABASE)\b)",
        r"(\'|\")(\s)*(OR|AND)(\s)+(\'|\"|[0-9])",
        r"(--|\#|\/\*)",
        r"(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+",
        r"SLEEP\s*\(\s*\d+\s*\)",
        r"BENCHMARK\s*\(",
    ],
    "xss": [
        r"<script[^>]*>.*?</script>",
        r"javascript\s*:",
        r"on(load|error|click|mouse|focus|blur)\s*=",
        r"<iframe[^>]*>",
        r"<object[^>]*>",
        r"<embed[^>]*>",
    ],
    "path_traversal": [
        r"\.\./",
        r"\.\.\\",
        r"/etc/passwd",
        r"/etc/shadow",
        r"c:\\windows",
    ],
    "command_injection": [
        r";\s*(ls|cat|rm|wget|curl|bash|sh|nc|netcat)",
        r"\|\s*(ls|cat|rm|wget|curl|bash|sh|nc|netcat)",
        r"`[^`]*`",
        r"\$\([^)]*\)",
    ],
}


class SecurityMiddleware(BaseHTTPMiddleware):
    """보안 미들웨어"""

    # 싱글톤 인스턴스 (관리 API에서 접근용)
    _instance: Optional["SecurityMiddleware"] = None

    def __init__(self, app: FastAPI, config: SecurityConfig):
        super().__init__(app)
        self.config = config

        # 인메모리 저장소 (프로덕션에서는 Redis 사용 권장)
        self.request_counts: dict[str, list[datetime]] = defaultdict(list)
        self.suspicious_activities: dict[str, SuspiciousActivity] = {}
        self.banned_ips: dict[str, BannedIPInfo] = {}

        # 공격 패턴 컴파일
        self.compiled_patterns: dict[str, list[re.Pattern]] = {}
        for attack_type, patterns in ATTACK_PATTERNS.items():
            self.compiled_patterns[attack_type] = [
                re.compile(p, re.IGNORECASE) for p in patterns
            ]

        # 싱글톤 설정
        SecurityMiddleware._instance = self

    @classmethod
    def get_instance(cls) -> Optional["SecurityMiddleware"]:
        """싱글톤 인스턴스 반환"""
        return cls._instance

    # ============================================
    # 관리 API용 메서드
    # ============================================

    def get_banned_list(self) -> list[dict]:
        """차단된 IP 목록 반환"""
        # 만료된 차단 정리
        self._cleanup_expired_bans()
        return [info.to_dict() for info in self.banned_ips.values()]

    def get_suspicious_list(self) -> list[dict]:
        """의심 활동 목록 반환"""
        return [activity.to_dict() for activity in self.suspicious_activities.values()]

    def get_stats(self) -> dict:
        """보안 통계 반환"""
        self._cleanup_expired_bans()
        return {
            "total_banned": len(self.banned_ips),
            "permanent_banned": sum(1 for b in self.banned_ips.values() if b.ban_until is None),
            "temporary_banned": sum(1 for b in self.banned_ips.values() if b.ban_until is not None),
            "suspicious_ips": len(self.suspicious_activities),
            "whitelist_count": len(self.config.whitelist),
            "blacklist_count": len(self.config.blacklist),
        }

    def manual_ban(self, ip: str, reason: str, duration_seconds: Optional[int] = None) -> BannedIPInfo:
        """수동 IP 차단"""
        ban_until = None
        if duration_seconds:
            ban_until = datetime.now() + timedelta(seconds=duration_seconds)

        info = BannedIPInfo(
            ip=ip,
            ban_type=BanType.MANUAL,
            reason=reason,
            banned_at=datetime.now(),
            ban_until=ban_until,
        )
        self.banned_ips[ip] = info
        logger.warning(f"Manual ban: {ip}, reason: {reason}, permanent: {ban_until is None}")
        return info

    def unban(self, ip: str) -> bool:
        """IP 차단 해제"""
        if ip in self.banned_ips:
            del self.banned_ips[ip]
            logger.info(f"IP unbanned: {ip}")
            return True
        return False

    def clear_suspicious(self, ip: str) -> bool:
        """의심 활동 기록 삭제"""
        if ip in self.suspicious_activities:
            del self.suspicious_activities[ip]
            return True
        return False

    def add_to_whitelist(self, ip: str) -> bool:
        """화이트리스트에 추가"""
        if ip not in self.config.whitelist:
            self.config.whitelist.append(ip)
            # 차단되어 있다면 해제
            self.unban(ip)
            return True
        return False

    def remove_from_whitelist(self, ip: str) -> bool:
        """화이트리스트에서 제거"""
        if ip in self.config.whitelist:
            self.config.whitelist.remove(ip)
            return True
        return False

    def add_to_blacklist(self, ip: str, reason: str = "수동 블랙리스트 등록") -> bool:
        """블랙리스트에 추가"""
        if ip not in self.config.blacklist:
            self.config.blacklist.append(ip)
            # 영구 차단으로 기록
            self.banned_ips[ip] = BannedIPInfo(
                ip=ip,
                ban_type=BanType.BLACKLIST,
                reason=reason,
                banned_at=datetime.now(),
                ban_until=None,  # 영구 차단
            )
            return True
        return False

    def remove_from_blacklist(self, ip: str) -> bool:
        """블랙리스트에서 제거"""
        if ip in self.config.blacklist:
            self.config.blacklist.remove(ip)
            self.unban(ip)
            return True
        return False

    def _cleanup_expired_bans(self):
        """만료된 차단 정리"""
        expired = [ip for ip, info in self.banned_ips.items() if info.is_expired()]
        for ip in expired:
            del self.banned_ips[ip]

    def get_client_ip(self, request: Request) -> str:
        """클라이언트 IP 추출"""
        # X-Forwarded-For 헤더 확인 (프록시/로드밸런서 뒤에 있는 경우)
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()

        # X-Real-IP 헤더 확인
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip

        # 직접 연결
        if request.client:
            return request.client.host

        return "unknown"

    def is_path_excluded(self, path: str) -> bool:
        """제외 경로 확인"""
        for excluded in self.config.excluded_paths:
            if path.startswith(excluded):
                return True
        return False

    def check_rate_limit(self, ip: str) -> tuple[bool, int]:
        """Rate Limit 확인"""
        now = datetime.now()
        window_start = now - timedelta(seconds=self.config.rate_limit_window)

        # 윈도우 내 요청만 유지
        self.request_counts[ip] = [
            t for t in self.request_counts[ip] if t > window_start
        ]

        current_count = len(self.request_counts[ip])

        if current_count >= self.config.rate_limit:
            remaining = 0
            retry_after = self.config.rate_limit_window
            return False, retry_after

        self.request_counts[ip].append(now)
        return True, 0

    def check_banned(self, ip: str) -> tuple[bool, int]:
        """IP 차단 여부 확인"""
        if ip in self.banned_ips:
            info = self.banned_ips[ip]
            if not info.is_expired():
                remaining = info.get_remaining_seconds()
                return True, remaining if remaining else 0
            else:
                # 차단 해제
                del self.banned_ips[ip]
        return False, 0

    def detect_attack(self, request: Request) -> Optional[str]:
        """공격 패턴 감지"""
        # URL 경로 검사
        path = request.url.path
        query = str(request.url.query)

        # 검사 대상 문자열
        check_strings = [path, query]

        for attack_type, patterns in self.compiled_patterns.items():
            for check_str in check_strings:
                for pattern in patterns:
                    if pattern.search(check_str):
                        return attack_type

        return None

    def ban_ip(self, ip: str, reason: str, attack_type: Optional[str] = None):
        """IP 차단 (자동)"""
        ban_until = datetime.now() + timedelta(seconds=self.config.auto_ban_duration)

        # 기존 의심 활동 정보 가져오기
        suspicious_count = 0
        if ip in self.suspicious_activities:
            suspicious_count = self.suspicious_activities[ip].count

        self.banned_ips[ip] = BannedIPInfo(
            ip=ip,
            ban_type=BanType.AUTO,
            reason=reason,
            banned_at=datetime.now(),
            ban_until=ban_until,
            suspicious_count=suspicious_count,
            last_attack_type=attack_type,
        )
        logger.warning(f"IP banned: {ip}, reason: {reason}, until: {ban_until}")

    def record_suspicious(self, ip: str, reason: str, attack_type: Optional[str] = None) -> bool:
        """의심 활동 기록 및 자동 차단 확인"""
        now = datetime.now()

        if ip not in self.suspicious_activities:
            self.suspicious_activities[ip] = SuspiciousActivity(
                ip=ip,
                count=0,
                first_seen=now,
                attack_types=[],
            )

        activity = self.suspicious_activities[ip]
        activity.count += 1
        activity.last_seen = now
        if attack_type and attack_type not in activity.attack_types:
            activity.attack_types.append(attack_type)

        logger.warning(f"Suspicious activity from {ip}: {reason} (count: {activity.count})")

        if self.config.enable_auto_ban and activity.count >= self.config.auto_ban_threshold:
            self.ban_ip(ip, f"Auto-banned after {activity.count} suspicious requests", attack_type)
            return True

        return False

    def create_block_response(
        self,
        reason: str,
        code: str,
        status_code: int = 403,
        retry_after: Optional[int] = None,
    ) -> JSONResponse:
        """차단 응답 생성 (프론트엔드 처리용)"""
        response_data = {
            "success": False,
            "error": {
                "code": code,
                "reason": reason,
                "blocked": True,
            }
        }

        if retry_after:
            response_data["error"]["retry_after"] = retry_after

        headers = {}
        if retry_after:
            headers["Retry-After"] = str(retry_after)

        return JSONResponse(
            status_code=status_code,
            content=response_data,
            headers=headers,
        )

    async def dispatch(self, request: Request, call_next) -> Response:
        """요청 처리"""
        path = request.url.path

        # 제외 경로는 검사 건너뛰기
        if self.is_path_excluded(path):
            return await call_next(request)

        ip = self.get_client_ip(request)

        # 1. 화이트리스트 확인
        if ip in self.config.whitelist:
            return await call_next(request)

        # 2. 블랙리스트 확인
        if ip in self.config.blacklist:
            return self.create_block_response(
                reason="IP가 차단 목록에 있습니다",
                code="IP_BLACKLISTED",
                status_code=403,
            )

        # 3. 자동 차단 확인
        is_banned, ban_remaining = self.check_banned(ip)
        if is_banned:
            return self.create_block_response(
                reason="일시적으로 접근이 차단되었습니다",
                code="IP_BANNED",
                status_code=403,
                retry_after=ban_remaining,
            )

        # 4. Rate Limit 확인
        if self.config.enable_rate_limit:
            allowed, retry_after = self.check_rate_limit(ip)
            if not allowed:
                self.record_suspicious(ip, "Rate limit exceeded", "rate_limit")
                return self.create_block_response(
                    reason="요청이 너무 많습니다. 잠시 후 다시 시도해주세요",
                    code="RATE_LIMITED",
                    status_code=429,
                    retry_after=retry_after,
                )

        # 5. 공격 패턴 감지
        if self.config.enable_penetration_detection:
            attack_type = self.detect_attack(request)
            if attack_type:
                banned = self.record_suspicious(ip, f"Attack detected: {attack_type}", attack_type)
                if banned:
                    return self.create_block_response(
                        reason="보안 위반으로 접근이 차단되었습니다",
                        code="SECURITY_VIOLATION",
                        status_code=403,
                        retry_after=self.config.auto_ban_duration,
                    )
                else:
                    return self.create_block_response(
                        reason="잘못된 요청입니다",
                        code="BAD_REQUEST",
                        status_code=400,
                    )

        # 정상 요청 처리
        response = await call_next(request)
        return response


def setup_security(app: FastAPI, config: Optional[SecurityConfig] = None):
    """보안 미들웨어 설정"""
    if config is None:
        config = SecurityConfig()

    app.add_middleware(SecurityMiddleware, config=config)
    logger.info("Security middleware enabled")
