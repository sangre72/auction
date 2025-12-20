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
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider: providerName } = await params;

  const ProviderClass = providers[providerName as keyof typeof providers];

  if (!ProviderClass) {
    return NextResponse.json(
      { error: 'Invalid provider' },
      { status: 400 }
    );
  }

  try {
    const provider = new ProviderClass();
    const state = generateState();

    // state를 쿠키에 저장 (CSRF 방지)
    const cookieStore = await cookies();
    cookieStore.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10분
    });

    const authUrl = provider.getAuthorizationUrl(state);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('OAuth initialization error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize OAuth' },
      { status: 500 }
    );
  }
}
