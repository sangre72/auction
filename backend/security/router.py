"""
보안 관리 API 라우터
- IP 차단 목록 조회
- IP 차단/해제
- 화이트리스트/블랙리스트 관리
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from core.security_guard import SecurityMiddleware
from core.security import require_super_admin


router = APIRouter(prefix="/security", tags=["Security Management"])


# ============================================
# 스키마
# ============================================

class BanIPRequest(BaseModel):
    """IP 차단 요청"""
    ip: str
    reason: str
    duration_seconds: Optional[int] = None  # None이면 영구 차단


class UnbanIPRequest(BaseModel):
    """IP 차단 해제 요청"""
    ip: str


class WhitelistRequest(BaseModel):
    """화이트리스트 요청"""
    ip: str


class BlacklistRequest(BaseModel):
    """블랙리스트 요청"""
    ip: str
    reason: Optional[str] = "수동 블랙리스트 등록"


# ============================================
# 헬퍼 함수
# ============================================

def get_security_middleware() -> SecurityMiddleware:
    """SecurityMiddleware 인스턴스 가져오기"""
    middleware = SecurityMiddleware.get_instance()
    if not middleware:
        raise HTTPException(
            status_code=503,
            detail="Security middleware not initialized"
        )
    return middleware


# ============================================
# API 엔드포인트
# ============================================

@router.get("/stats")
async def get_security_stats(_: dict = Depends(require_super_admin)):
    """보안 통계 조회"""
    middleware = get_security_middleware()
    return {
        "success": True,
        "data": middleware.get_stats(),
    }


@router.get("/banned")
async def get_banned_list(_: dict = Depends(require_super_admin)):
    """차단된 IP 목록 조회"""
    middleware = get_security_middleware()
    return {
        "success": True,
        "data": middleware.get_banned_list(),
    }


@router.get("/suspicious")
async def get_suspicious_list(_: dict = Depends(require_super_admin)):
    """의심 활동 IP 목록 조회"""
    middleware = get_security_middleware()
    return {
        "success": True,
        "data": middleware.get_suspicious_list(),
    }


@router.post("/ban")
async def ban_ip(request: BanIPRequest, _: dict = Depends(require_super_admin)):
    """IP 수동 차단"""
    middleware = get_security_middleware()
    info = middleware.manual_ban(
        ip=request.ip,
        reason=request.reason,
        duration_seconds=request.duration_seconds,
    )
    return {
        "success": True,
        "message": f"IP {request.ip} has been banned",
        "data": info.to_dict(),
    }


@router.post("/unban")
async def unban_ip(request: UnbanIPRequest, _: dict = Depends(require_super_admin)):
    """IP 차단 해제"""
    middleware = get_security_middleware()
    success = middleware.unban(request.ip)
    if not success:
        raise HTTPException(
            status_code=404,
            detail=f"IP {request.ip} is not banned"
        )
    return {
        "success": True,
        "message": f"IP {request.ip} has been unbanned",
    }


@router.delete("/suspicious/{ip}")
async def clear_suspicious(ip: str, _: dict = Depends(require_super_admin)):
    """의심 활동 기록 삭제"""
    middleware = get_security_middleware()
    success = middleware.clear_suspicious(ip)
    if not success:
        raise HTTPException(
            status_code=404,
            detail=f"No suspicious activity found for IP {ip}"
        )
    return {
        "success": True,
        "message": f"Suspicious activity for IP {ip} has been cleared",
    }


@router.get("/whitelist")
async def get_whitelist(_: dict = Depends(require_super_admin)):
    """화이트리스트 조회"""
    middleware = get_security_middleware()
    return {
        "success": True,
        "data": middleware.config.whitelist,
    }


@router.post("/whitelist")
async def add_to_whitelist(request: WhitelistRequest, _: dict = Depends(require_super_admin)):
    """화이트리스트에 추가"""
    middleware = get_security_middleware()
    success = middleware.add_to_whitelist(request.ip)
    if not success:
        raise HTTPException(
            status_code=400,
            detail=f"IP {request.ip} is already in whitelist"
        )
    return {
        "success": True,
        "message": f"IP {request.ip} added to whitelist",
    }


@router.delete("/whitelist/{ip}")
async def remove_from_whitelist(ip: str, _: dict = Depends(require_super_admin)):
    """화이트리스트에서 제거"""
    middleware = get_security_middleware()
    success = middleware.remove_from_whitelist(ip)
    if not success:
        raise HTTPException(
            status_code=404,
            detail=f"IP {ip} is not in whitelist"
        )
    return {
        "success": True,
        "message": f"IP {ip} removed from whitelist",
    }


@router.get("/blacklist")
async def get_blacklist(_: dict = Depends(require_super_admin)):
    """블랙리스트 조회"""
    middleware = get_security_middleware()
    return {
        "success": True,
        "data": middleware.config.blacklist,
    }


@router.post("/blacklist")
async def add_to_blacklist(request: BlacklistRequest, _: dict = Depends(require_super_admin)):
    """블랙리스트에 추가 (영구 차단)"""
    middleware = get_security_middleware()
    success = middleware.add_to_blacklist(request.ip, request.reason or "수동 블랙리스트 등록")
    if not success:
        raise HTTPException(
            status_code=400,
            detail=f"IP {request.ip} is already in blacklist"
        )
    return {
        "success": True,
        "message": f"IP {request.ip} added to blacklist (permanently banned)",
    }


@router.delete("/blacklist/{ip}")
async def remove_from_blacklist(ip: str, _: dict = Depends(require_super_admin)):
    """블랙리스트에서 제거"""
    middleware = get_security_middleware()
    success = middleware.remove_from_blacklist(ip)
    if not success:
        raise HTTPException(
            status_code=404,
            detail=f"IP {ip} is not in blacklist"
        )
    return {
        "success": True,
        "message": f"IP {ip} removed from blacklist",
    }
