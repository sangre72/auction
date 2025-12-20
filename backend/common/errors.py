"""
커스텀 에러 클래스
"""

from typing import Optional, Any
from fastapi import HTTPException, status


class AppException(HTTPException):
    """애플리케이션 기본 예외"""

    def __init__(
        self,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail: str = "서버 오류가 발생했습니다",
        error_code: Optional[str] = None,
        headers: Optional[dict[str, str]] = None,
    ):
        super().__init__(status_code=status_code, detail=detail, headers=headers)
        self.error_code = error_code


class NotFoundException(AppException):
    """리소스를 찾을 수 없음"""

    def __init__(
        self,
        detail: str = "리소스를 찾을 수 없습니다",
        error_code: str = "NOT_FOUND",
    ):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail,
            error_code=error_code,
        )


class BadRequestException(AppException):
    """잘못된 요청"""

    def __init__(
        self,
        detail: str = "잘못된 요청입니다",
        error_code: str = "BAD_REQUEST",
    ):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
            error_code=error_code,
        )


class UnauthorizedException(AppException):
    """인증 실패"""

    def __init__(
        self,
        detail: str = "인증이 필요합니다",
        error_code: str = "UNAUTHORIZED",
    ):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            error_code=error_code,
            headers={"WWW-Authenticate": "Bearer"},
        )


class ForbiddenException(AppException):
    """권한 없음"""

    def __init__(
        self,
        detail: str = "권한이 없습니다",
        error_code: str = "FORBIDDEN",
    ):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
            error_code=error_code,
        )


class ConflictException(AppException):
    """리소스 충돌"""

    def __init__(
        self,
        detail: str = "이미 존재하는 리소스입니다",
        error_code: str = "CONFLICT",
    ):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail,
            error_code=error_code,
        )
