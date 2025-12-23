import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session');

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  // 토큰이 존재하면 인증된 것으로 간주
  // 실제 토큰 검증은 백엔드 API 호출 시 수행됨
  return NextResponse.json({ authenticated: true });
}
