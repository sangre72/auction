"""
OAuth 인증 라우터
"""

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import RedirectResponse
import secrets
import os

from app.services.oauth import get_oauth_provider, send_to_n8n
from app.models.user import OAuthCallbackResponse

router = APIRouter(prefix="/auth", tags=["auth"])

# 세션 스토어 (프로덕션에서는 Redis 사용 권장)
session_store: dict = {}


@router.get("/{provider}")
async def oauth_login(provider: str, request: Request):
    """
    OAuth 로그인 시작
    제공자의 인증 페이지로 리다이렉트
    """
    try:
        oauth_provider = get_oauth_provider(provider)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # CSRF 방지를 위한 state 생성
    state = secrets.token_urlsafe(16)
    session_store[state] = {"provider": provider}

    auth_url = oauth_provider.get_authorization_url(state)
    return RedirectResponse(auth_url)


@router.get("/{provider}/callback")
async def oauth_callback(provider: str, code: str, state: str):
    """
    OAuth 콜백 처리
    인가 코드를 받아서 액세스 토큰과 사용자 정보를 받음
    """
    # state 검증
    if state not in session_store:
        raise HTTPException(status_code=400, detail="잘못된 state 파라미터")

    try:
        oauth_provider = get_oauth_provider(provider)

        # 액세스 토큰 받기
        token_response = await oauth_provider.get_access_token(code, state)

        # 사용자 정보 받기
        user_info = await oauth_provider.get_user_info(token_response.access_token)

        # N8N 웹훅으로 전송 (비동기)
        try:
            await send_to_n8n(user_info)
        except Exception as e:
            print(f"N8N 웹훅 전송 실패: {e}")

        # 세션 정리
        del session_store[state]

        # 여기서 데이터베이스에 사용자 저장 또는 업데이트
        # user = await save_or_update_user(user_info)

        # JWT 토큰 생성 등 추가 작업
        # session_token = create_session_token(user)

        # 프론트엔드로 리다이렉트 (토큰을 쿼리 파라미터로 전달)
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        return RedirectResponse(
            f"{frontend_url}/auth/success?provider={provider}&user_id={user_info.id}"
        )

    except Exception as e:
        print(f"OAuth 콜백 오류: {e}")
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
        return RedirectResponse(f"{frontend_url}/auth/error?reason=callback_failed")


@router.get("/user/{provider}/{user_id}")
async def get_user(provider: str, user_id: str):
    """
    사용자 정보 조회 (예시)
    실제로는 데이터베이스에서 조회해야 함
    """
    # 데이터베이스에서 사용자 조회
    # user = await db.get_user(provider, user_id)
    # return user

    return {
        "message": "사용자 정보 조회 기능은 데이터베이스 연동 후 구현됩니다.",
        "provider": provider,
        "user_id": user_id,
    }
