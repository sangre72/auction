"""
OAuth 소셜 인증 서비스
"""

import httpx
import os
from typing import Dict, Any
from app.models.user import UserInfo, TokenResponse


class OAuthProvider:
    """OAuth 제공자 기본 클래스"""

    def __init__(self):
        self.client_id = ""
        self.client_secret = ""
        self.redirect_uri = ""

    def get_authorization_url(self, state: str) -> str:
        """인증 URL 생성"""
        raise NotImplementedError

    async def get_access_token(self, code: str, state: str = "") -> TokenResponse:
        """액세스 토큰 받기"""
        raise NotImplementedError

    async def get_user_info(self, access_token: str) -> UserInfo:
        """사용자 정보 받기"""
        raise NotImplementedError


class KakaoOAuthProvider(OAuthProvider):
    """카카오 OAuth 제공자"""

    def __init__(self):
        super().__init__()
        self.client_id = os.getenv("KAKAO_CLIENT_ID", "")
        self.client_secret = os.getenv("KAKAO_CLIENT_SECRET", "")
        self.redirect_uri = os.getenv("KAKAO_REDIRECT_URI", "")

    def get_authorization_url(self, state: str) -> str:
        """카카오 인증 URL 생성"""
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "response_type": "code",
            "state": state,
        }
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        return f"https://kauth.kakao.com/oauth/authorize?{query_string}"

    async def get_access_token(self, code: str, state: str = "") -> TokenResponse:
        """카카오 액세스 토큰 받기"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://kauth.kakao.com/oauth/token",
                data={
                    "grant_type": "authorization_code",
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "code": code,
                    "redirect_uri": self.redirect_uri,
                },
            )

            if response.status_code != 200:
                raise Exception(f"카카오 토큰 요청 실패: {response.text}")

            data = response.json()
            return TokenResponse(
                access_token=data["access_token"],
                refresh_token=data.get("refresh_token"),
                expires_in=data.get("expires_in"),
                token_type=data.get("token_type", "Bearer"),
            )

    async def get_user_info(self, access_token: str) -> UserInfo:
        """카카오 사용자 정보 받기"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://kapi.kakao.com/v2/user/me",
                headers={"Authorization": f"Bearer {access_token}"},
            )

            if response.status_code != 200:
                raise Exception(f"카카오 사용자 정보 요청 실패: {response.text}")

            data = response.json()
            kakao_account = data.get("kakao_account", {})
            profile = kakao_account.get("profile", {})

            return UserInfo(
                id=str(data["id"]),
                email=kakao_account.get("email"),
                name=profile.get("nickname"),
                profile_image=profile.get("profile_image_url"),
                provider="kakao",
            )


class NaverOAuthProvider(OAuthProvider):
    """네이버 OAuth 제공자"""

    def __init__(self):
        super().__init__()
        self.client_id = os.getenv("NAVER_CLIENT_ID", "")
        self.client_secret = os.getenv("NAVER_CLIENT_SECRET", "")
        self.redirect_uri = os.getenv("NAVER_REDIRECT_URI", "")

    def get_authorization_url(self, state: str) -> str:
        """네이버 인증 URL 생성"""
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "response_type": "code",
            "state": state,
        }
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        return f"https://nid.naver.com/oauth2.0/authorize?{query_string}"

    async def get_access_token(self, code: str, state: str) -> TokenResponse:
        """네이버 액세스 토큰 받기"""
        params = {
            "grant_type": "authorization_code",
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "code": code,
            "state": state,
        }
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://nid.naver.com/oauth2.0/token?{query_string}"
            )

            if response.status_code != 200:
                raise Exception(f"네이버 토큰 요청 실패: {response.text}")

            data = response.json()
            return TokenResponse(
                access_token=data["access_token"],
                refresh_token=data.get("refresh_token"),
                expires_in=data.get("expires_in"),
                token_type=data.get("token_type", "Bearer"),
            )

    async def get_user_info(self, access_token: str) -> UserInfo:
        """네이버 사용자 정보 받기"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://openapi.naver.com/v1/nid/me",
                headers={"Authorization": f"Bearer {access_token}"},
            )

            if response.status_code != 200:
                raise Exception(f"네이버 사용자 정보 요청 실패: {response.text}")

            data = response.json()

            if data["resultcode"] != "00":
                raise Exception(f"네이버 API 오류: {data['message']}")

            profile = data["response"]
            return UserInfo(
                id=profile["id"],
                email=profile.get("email"),
                name=profile.get("name"),
                profile_image=profile.get("profile_image"),
                provider="naver",
            )


class GoogleOAuthProvider(OAuthProvider):
    """구글 OAuth 제공자"""

    def __init__(self):
        super().__init__()
        self.client_id = os.getenv("GOOGLE_CLIENT_ID", "")
        self.client_secret = os.getenv("GOOGLE_CLIENT_SECRET", "")
        self.redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "")

    def get_authorization_url(self, state: str) -> str:
        """구글 인증 URL 생성"""
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "response_type": "code",
            "scope": "openid profile email",
            "state": state,
            "access_type": "offline",
            "prompt": "consent",
        }
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        return f"https://accounts.google.com/o/oauth2/v2/auth?{query_string}"

    async def get_access_token(self, code: str, state: str = "") -> TokenResponse:
        """구글 액세스 토큰 받기"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "grant_type": "authorization_code",
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "code": code,
                    "redirect_uri": self.redirect_uri,
                },
            )

            if response.status_code != 200:
                raise Exception(f"구글 토큰 요청 실패: {response.text}")

            data = response.json()
            return TokenResponse(
                access_token=data["access_token"],
                refresh_token=data.get("refresh_token"),
                expires_in=data.get("expires_in"),
                token_type=data.get("token_type", "Bearer"),
            )

    async def get_user_info(self, access_token: str) -> UserInfo:
        """구글 사용자 정보 받기"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
                headers={"Authorization": f"Bearer {access_token}"},
            )

            if response.status_code != 200:
                raise Exception(f"구글 사용자 정보 요청 실패: {response.text}")

            data = response.json()
            return UserInfo(
                id=data["id"],
                email=data.get("email"),
                name=data.get("name"),
                profile_image=data.get("picture"),
                provider="google",
            )


# 제공자 팩토리
def get_oauth_provider(provider_name: str) -> OAuthProvider:
    """OAuth 제공자 인스턴스 반환"""
    providers = {
        "kakao": KakaoOAuthProvider,
        "naver": NaverOAuthProvider,
        "google": GoogleOAuthProvider,
    }

    provider_class = providers.get(provider_name)
    if not provider_class:
        raise ValueError(f"지원하지 않는 제공자: {provider_name}")

    return provider_class()


async def send_to_n8n(user_info: UserInfo) -> None:
    """N8N 웹훅으로 사용자 정보 전송"""
    webhook_url = os.getenv("N8N_WEBHOOK_URL")

    if not webhook_url:
        print("N8N_WEBHOOK_URL이 설정되지 않음, 웹훅 전송 생략")
        return

    try:
        async with httpx.AsyncClient() as client:
            await client.post(
                webhook_url,
                json={
                    "event": "user_login",
                    "provider": user_info.provider,
                    "user": user_info.model_dump(),
                    "timestamp": None,  # 자동으로 ISO 형식으로 변환됨
                },
                timeout=5.0,
            )
    except Exception as e:
        print(f"N8N 웹훅 전송 실패: {e}")
