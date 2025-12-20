# OAuth 소셜 인증 코드 예제

## 1. Next.js + TypeScript 구현

### 공통 인터페이스 (`src/lib/auth/index.ts`)

```typescript
export interface OAuthProvider {
  name: string;
  getAuthorizationUrl(state: string): string;
  getAccessToken(code: string): Promise<TokenResponse>;
  getUserInfo(accessToken: string): Promise<UserInfo>;
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type: string;
}

export interface UserInfo {
  id: string;
  email?: string;
  name?: string;
  profileImage?: string;
  provider: string;
}

export function generateState(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}
```

### 카카오 OAuth 구현 (`src/lib/auth/kakao.ts`)

```typescript
import type { OAuthProvider, TokenResponse, UserInfo } from './index';

export class KakaoOAuthProvider implements OAuthProvider {
  name = 'kakao';

  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.KAKAO_CLIENT_ID!;
    this.clientSecret = process.env.KAKAO_CLIENT_SECRET!;
    this.redirectUri = process.env.KAKAO_REDIRECT_URI!;
  }

  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      state,
    });

    return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
  }

  async getAccessToken(code: string): Promise<TokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code,
      redirect_uri: this.redirectUri,
    });

    const response = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      throw new Error(`Kakao token error: ${response.statusText}`);
    }

    return response.json();
  }

  async getUserInfo(accessToken: string): Promise<UserInfo> {
    const response = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Kakao user info error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      id: data.id.toString(),
      email: data.kakao_account?.email,
      name: data.kakao_account?.profile?.nickname,
      profileImage: data.kakao_account?.profile?.profile_image_url,
      provider: 'kakao',
    };
  }
}
```

### 네이버 OAuth 구현 (`src/lib/auth/naver.ts`)

```typescript
import type { OAuthProvider, TokenResponse, UserInfo } from './index';

export class NaverOAuthProvider implements OAuthProvider {
  name = 'naver';

  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.NAVER_CLIENT_ID!;
    this.clientSecret = process.env.NAVER_CLIENT_SECRET!;
    this.redirectUri = process.env.NAVER_REDIRECT_URI!;
  }

  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      state,
    });

    return `https://nid.naver.com/oauth2.0/authorize?${params.toString()}`;
  }

  async getAccessToken(code: string): Promise<TokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code,
      state: 'STATE_STRING', // 실제로는 세션에서 검증해야 함
    });

    const response = await fetch(`https://nid.naver.com/oauth2.0/token?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Naver token error: ${response.statusText}`);
    }

    return response.json();
  }

  async getUserInfo(accessToken: string): Promise<UserInfo> {
    const response = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Naver user info error: ${response.statusText}`);
    }

    const data = await response.json();
    const profile = data.response;

    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      profileImage: profile.profile_image,
      provider: 'naver',
    };
  }
}
```

### 구글 OAuth 구현 (`src/lib/auth/google.ts`)

```typescript
import type { OAuthProvider, TokenResponse, UserInfo } from './index';

export class GoogleOAuthProvider implements OAuthProvider {
  name = 'google';

  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID!;
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    this.redirectUri = process.env.GOOGLE_REDIRECT_URI!;
  }

  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'openid profile email',
      state,
      access_type: 'offline',
      prompt: 'consent',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async getAccessToken(code: string): Promise<TokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code,
      redirect_uri: this.redirectUri,
    });

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      throw new Error(`Google token error: ${response.statusText}`);
    }

    return response.json();
  }

  async getUserInfo(accessToken: string): Promise<UserInfo> {
    const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Google user info error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      profileImage: data.picture,
      provider: 'google',
    };
  }
}
```

### Next.js API Route (`src/app/api/auth/[provider]/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { KakaoOAuthProvider } from '@/lib/auth/kakao';
import { NaverOAuthProvider } from '@/lib/auth/naver';
import { GoogleOAuthProvider } from '@/lib/auth/google';
import { generateState } from '@/lib/auth';

const providers = {
  kakao: KakaoOAuthProvider,
  naver: NaverOAuthProvider,
  google: GoogleOAuthProvider,
};

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  const { provider: providerName } = params;

  const ProviderClass = providers[providerName as keyof typeof providers];

  if (!ProviderClass) {
    return NextResponse.json(
      { error: 'Invalid provider' },
      { status: 400 }
    );
  }

  const provider = new ProviderClass();
  const state = generateState();

  // state를 쿠키에 저장 (CSRF 방지)
  cookies().set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10, // 10분
  });

  const authUrl = provider.getAuthorizationUrl(state);

  return NextResponse.redirect(authUrl);
}
```

### OAuth 콜백 Route (`src/app/api/auth/callback/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { KakaoOAuthProvider } from '@/lib/auth/kakao';
import { NaverOAuthProvider } from '@/lib/auth/naver';
import { GoogleOAuthProvider } from '@/lib/auth/google';

const providers = {
  kakao: KakaoOAuthProvider,
  naver: NaverOAuthProvider,
  google: GoogleOAuthProvider,
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const providerName = searchParams.get('provider');

  // state 검증 (CSRF 방지)
  const savedState = cookies().get('oauth_state')?.value;

  if (!code || !state || state !== savedState) {
    return NextResponse.json(
      { error: 'Invalid state parameter' },
      { status: 400 }
    );
  }

  if (!providerName) {
    return NextResponse.json(
      { error: 'Provider not specified' },
      { status: 400 }
    );
  }

  const ProviderClass = providers[providerName as keyof typeof providers];

  if (!ProviderClass) {
    return NextResponse.json(
      { error: 'Invalid provider' },
      { status: 400 }
    );
  }

  try {
    const provider = new ProviderClass();

    // 액세스 토큰 받기
    const tokenResponse = await provider.getAccessToken(code);

    // 사용자 정보 받기
    const userInfo = await provider.getUserInfo(tokenResponse.access_token);

    // 여기서 데이터베이스에 사용자 저장 또는 업데이트
    // const user = await saveOrUpdateUser(userInfo);

    // 세션 생성 (예: JWT)
    // const session = await createSession(user);

    // state 쿠키 삭제
    cookies().delete('oauth_state');

    // 성공 시 프론트엔드로 리다이렉트
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/success?user=${encodeURIComponent(JSON.stringify(userInfo))}`
    );
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/error`
    );
  }
}
```

## 2. Python FastAPI 구현

### FastAPI OAuth 라우터 (`backend/app/routers/auth.py`)

```python
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import RedirectResponse
import httpx
import secrets
import os

router = APIRouter(prefix="/auth", tags=["auth"])

# 세션 스토어 (프로덕션에서는 Redis 사용)
session_store = {}


@router.get("/kakao")
async def kakao_login(request: Request):
    state = secrets.token_urlsafe(16)
    session_store[state] = {"provider": "kakao"}

    params = {
        "client_id": os.getenv("KAKAO_CLIENT_ID"),
        "redirect_uri": os.getenv("KAKAO_REDIRECT_URI"),
        "response_type": "code",
        "state": state,
    }

    auth_url = f"https://kauth.kakao.com/oauth/authorize?{'&'.join([f'{k}={v}' for k, v in params.items()])}"
    return RedirectResponse(auth_url)


@router.get("/kakao/callback")
async def kakao_callback(code: str, state: str):
    if state not in session_store:
        raise HTTPException(status_code=400, detail="Invalid state")

    async with httpx.AsyncClient() as client:
        # 토큰 요청
        token_response = await client.post(
            "https://kauth.kakao.com/oauth/token",
            data={
                "grant_type": "authorization_code",
                "client_id": os.getenv("KAKAO_CLIENT_ID"),
                "client_secret": os.getenv("KAKAO_CLIENT_SECRET"),
                "code": code,
                "redirect_uri": os.getenv("KAKAO_REDIRECT_URI"),
            },
        )

        if token_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Token request failed")

        token_data = token_response.json()
        access_token = token_data["access_token"]

        # 사용자 정보 요청
        user_response = await client.get(
            "https://kapi.kakao.com/v2/user/me",
            headers={"Authorization": f"Bearer {access_token}"},
        )

        if user_response.status_code != 200:
            raise HTTPException(status_code=400, detail="User info request failed")

        user_data = user_response.json()

        # 세션 정리
        del session_store[state]

        return {
            "user": {
                "id": str(user_data["id"]),
                "email": user_data.get("kakao_account", {}).get("email"),
                "name": user_data.get("kakao_account", {}).get("profile", {}).get("nickname"),
                "provider": "kakao",
            },
            "access_token": access_token,
        }


@router.get("/naver")
async def naver_login():
    state = secrets.token_urlsafe(16)
    session_store[state] = {"provider": "naver"}

    params = {
        "client_id": os.getenv("NAVER_CLIENT_ID"),
        "redirect_uri": os.getenv("NAVER_REDIRECT_URI"),
        "response_type": "code",
        "state": state,
    }

    auth_url = f"https://nid.naver.com/oauth2.0/authorize?{'&'.join([f'{k}={v}' for k, v in params.items()])}"
    return RedirectResponse(auth_url)


@router.get("/naver/callback")
async def naver_callback(code: str, state: str):
    if state not in session_store:
        raise HTTPException(status_code=400, detail="Invalid state")

    async with httpx.AsyncClient() as client:
        token_params = {
            "grant_type": "authorization_code",
            "client_id": os.getenv("NAVER_CLIENT_ID"),
            "client_secret": os.getenv("NAVER_CLIENT_SECRET"),
            "code": code,
            "state": state,
        }

        token_response = await client.get(
            f"https://nid.naver.com/oauth2.0/token?{'&'.join([f'{k}={v}' for k, v in token_params.items()])}"
        )

        if token_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Token request failed")

        token_data = token_response.json()
        access_token = token_data["access_token"]

        user_response = await client.get(
            "https://openapi.naver.com/v1/nid/me",
            headers={"Authorization": f"Bearer {access_token}"},
        )

        if user_response.status_code != 200:
            raise HTTPException(status_code=400, detail="User info request failed")

        user_data = user_response.json()
        profile = user_data["response"]

        del session_store[state]

        return {
            "user": {
                "id": profile["id"],
                "email": profile.get("email"),
                "name": profile.get("name"),
                "provider": "naver",
            },
            "access_token": access_token,
        }


@router.get("/google")
async def google_login():
    state = secrets.token_urlsafe(16)
    session_store[state] = {"provider": "google"}

    params = {
        "client_id": os.getenv("GOOGLE_CLIENT_ID"),
        "redirect_uri": os.getenv("GOOGLE_REDIRECT_URI"),
        "response_type": "code",
        "scope": "openid profile email",
        "state": state,
        "access_type": "offline",
        "prompt": "consent",
    }

    auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{'&'.join([f'{k}={v}' for k, v in params.items()])}"
    return RedirectResponse(auth_url)


@router.get("/google/callback")
async def google_callback(code: str, state: str):
    if state not in session_store:
        raise HTTPException(status_code=400, detail="Invalid state")

    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "grant_type": "authorization_code",
                "client_id": os.getenv("GOOGLE_CLIENT_ID"),
                "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
                "code": code,
                "redirect_uri": os.getenv("GOOGLE_REDIRECT_URI"),
            },
        )

        if token_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Token request failed")

        token_data = token_response.json()
        access_token = token_data["access_token"]

        user_response = await client.get(
            "https://www.googleapis.com/oauth2/v1/userinfo?alt=json",
            headers={"Authorization": f"Bearer {access_token}"},
        )

        if user_response.status_code != 200:
            raise HTTPException(status_code=400, detail="User info request failed")

        user_data = user_response.json()

        del session_store[state]

        return {
            "user": {
                "id": user_data["id"],
                "email": user_data.get("email"),
                "name": user_data.get("name"),
                "provider": "google",
            },
            "access_token": access_token,
        }
```

## 3. 프론트엔드 사용 예제

### React 컴포넌트 (`src/components/SocialLoginButtons.tsx`)

```typescript
'use client';

import { FcGoogle } from 'react-icons/fc';
import { SiNaver, SiKakaotalk } from 'react-icons/si';

export default function SocialLoginButtons() {
  const handleLogin = (provider: string) => {
    window.location.href = `/api/auth/${provider}`;
  };

  return (
    <div className="flex flex-col gap-3 w-full max-w-md">
      <button
        onClick={() => handleLogin('google')}
        className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
      >
        <FcGoogle size={20} />
        <span>구글로 계속하기</span>
      </button>

      <button
        onClick={() => handleLogin('kakao')}
        className="flex items-center justify-center gap-2 px-4 py-3 bg-[#FEE500] text-[#000000] rounded-lg hover:bg-[#FDD835] transition"
      >
        <SiKakaotalk size={20} />
        <span>카카오로 계속하기</span>
      </button>

      <button
        onClick={() => handleLogin('naver')}
        className="flex items-center justify-center gap-2 px-4 py-3 bg-[#03C75A] text-white rounded-lg hover:bg-[#02B350] transition"
      >
        <SiNaver size={20} />
        <span>네이버로 계속하기</span>
      </button>
    </div>
  );
}
```

## 4. 환경 변수 설정 (`.env.local`)

```bash
# 카카오 OAuth
KAKAO_CLIENT_ID=your_kakao_rest_api_key
KAKAO_CLIENT_SECRET=your_kakao_client_secret
KAKAO_REDIRECT_URI=http://localhost:3000/api/auth/callback?provider=kakao

# 네이버 OAuth
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
NAVER_REDIRECT_URI=http://localhost:3000/api/auth/callback?provider=naver

# 구글 OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback?provider=google

# 앱 URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

이 예제들을 사용하여 각 프로젝트에 맞게 커스터마이징할 수 있습니다.
