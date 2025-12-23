import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function POST() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('admin_session');
  const refreshToken = cookieStore.get('admin_refresh');

  // 백엔드 로그아웃 API 호출 (토큰 블랙리스트에 추가)
  if (accessToken) {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          Cookie: `admin_session=${accessToken.value}${refreshToken ? `; admin_refresh=${refreshToken.value}` : ''}`,
        },
      });
    } catch {
      // 백엔드 호출 실패해도 쿠키는 삭제
    }
  }

  // 쿠키 삭제
  cookieStore.delete('admin_session');
  cookieStore.delete('admin_refresh');

  return NextResponse.json({ success: true });
}
