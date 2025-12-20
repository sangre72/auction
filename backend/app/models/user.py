"""
사용자 모델
"""

from pydantic import BaseModel, EmailStr
from typing import Optional


class UserInfo(BaseModel):
    """OAuth 제공자로부터 받은 사용자 정보"""

    id: str
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    profile_image: Optional[str] = None
    provider: str


class TokenResponse(BaseModel):
    """OAuth 토큰 응답"""

    access_token: str
    refresh_token: Optional[str] = None
    expires_in: Optional[int] = None
    token_type: str = "Bearer"


class OAuthCallbackResponse(BaseModel):
    """OAuth 콜백 응답"""

    user: UserInfo
    access_token: str
    message: str = "로그인 성공"
