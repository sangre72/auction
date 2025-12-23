import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Access Token: 30분, Refresh Token: 7일
const ACCESS_TOKEN_MAX_AGE = 60 * 30;
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: '아이디와 비밀번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 백엔드 로그인 API 호출
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: username.includes('@') ? username : `${username}@auction.com`,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || '로그인에 실패했습니다.' },
        { status: response.status }
      );
    }

    const { access_token, refresh_token, admin } = data.data;

    // 쿠키에 토큰 저장 (미들웨어 인증용)
    const cookieStore = await cookies();

    // Access Token 쿠키
    cookieStore.set('admin_session', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: ACCESS_TOKEN_MAX_AGE,
      path: '/',
    });

    // Refresh Token 쿠키 (refresh 엔드포인트에서만 전송)
    cookieStore.set('admin_refresh', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_MAX_AGE,
      path: '/api/auth/refresh',
    });

    return NextResponse.json({
      success: true,
      // 토큰은 httpOnly 쿠키로만 전달 (XSS 방지)
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: '로그인 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
