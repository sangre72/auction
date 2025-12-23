import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Access Token: 30분, Refresh Token: 7일
const ACCESS_TOKEN_MAX_AGE = 60 * 30;
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7;

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('admin_refresh');

  if (!refreshToken) {
    return NextResponse.json(
      { error: 'Refresh token not found' },
      { status: 401 }
    );
  }

  try {
    // 백엔드 refresh API 호출
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        Cookie: `admin_refresh=${refreshToken.value}`,
      },
    });

    if (!response.ok) {
      // 갱신 실패 시 쿠키 삭제
      cookieStore.delete('admin_session');
      cookieStore.delete('admin_refresh');
      return NextResponse.json(
        { error: 'Token refresh failed' },
        { status: 401 }
      );
    }

    const data = await response.json();
    const { access_token, refresh_token } = data.data;

    // 새 토큰으로 쿠키 업데이트
    cookieStore.set('admin_session', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: ACCESS_TOKEN_MAX_AGE,
      path: '/',
    });

    cookieStore.set('admin_refresh', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_MAX_AGE,
      path: '/api/auth/refresh',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Token refresh error:', error);
    // 에러 시 쿠키 삭제
    cookieStore.delete('admin_session');
    cookieStore.delete('admin_refresh');
    return NextResponse.json(
      { error: 'Token refresh failed' },
      { status: 500 }
    );
  }
}
