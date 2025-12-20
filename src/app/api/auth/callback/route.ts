import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { KakaoOAuthProvider } from '@/lib/auth/kakao';
import { NaverOAuthProvider } from '@/lib/auth/naver';
import { GoogleOAuthProvider } from '@/lib/auth/google';
import { sendToN8N } from '@/lib/auth';
import {
  OAuthError,
  OAuthErrorCode,
  UserDeniedError,
  InvalidStateError,
  logError,
} from '@/lib/auth/errors';

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

  // OAuth 에러 파라미터 확인 (사용자 거부 등)
  const oauthError = searchParams.get('error');
  const oauthErrorDescription = searchParams.get('error_description');

  // 사용자가 로그인을 거부한 경우
  if (oauthError === 'access_denied') {
    const error = new UserDeniedError(providerName || 'unknown');
    logError(error, { url: request.url });

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/error?reason=user_denied&provider=${providerName}`
    );
  }

  // 기타 OAuth 에러
  if (oauthError) {
    logError(new Error(`OAuth error: ${oauthError}`), {
      error: oauthError,
      description: oauthErrorDescription,
      provider: providerName,
      url: request.url,
    });

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/error?reason=oauth_error&error=${oauthError}&provider=${providerName}`
    );
  }

  // state 검증 (CSRF 방지)
  const cookieStore = await cookies();
  const savedState = cookieStore.get('oauth_state')?.value;

  if (!code || !state || state !== savedState) {
    const error = new InvalidStateError();
    logError(error, {
      hasCode: !!code,
      hasState: !!state,
      stateMatches: state === savedState,
      provider: providerName,
    });

    // state 쿠키 삭제 (보안)
    cookieStore.delete('oauth_state');

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/error?reason=invalid_state&provider=${providerName}`
    );
  }

  if (!providerName) {
    logError(new Error('Provider not specified'), { url: request.url });
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/error?reason=no_provider`
    );
  }

  const ProviderClass = providers[providerName as keyof typeof providers];

  if (!ProviderClass) {
    logError(new Error(`Invalid provider: ${providerName}`), {
      provider: providerName,
    });

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/error?reason=invalid_provider&provider=${providerName}`
    );
  }

  try {
    const provider = new ProviderClass();

    // 액세스 토큰 받기
    const tokenResponse = await provider.getAccessToken(code, state);

    // 사용자 정보 받기
    const userInfo = await provider.getUserInfo(tokenResponse.access_token);

    // N8N 웹훅으로 전송 (비동기, 실패해도 무시)
    sendToN8N(userInfo).catch((err) =>
      console.error('N8N webhook failed:', err)
    );

    // 여기서 데이터베이스에 사용자 저장 또는 업데이트
    // const user = await saveOrUpdateUser(userInfo);

    // 세션 생성 (예: JWT)
    // const session = await createSession(user);

    // state 쿠키 삭제
    cookieStore.delete('oauth_state');

    // 성공 시 프론트엔드로 리다이렉트
    const successUrl = new URL('/auth/success', process.env.NEXT_PUBLIC_APP_URL!);
    successUrl.searchParams.set('user', encodeURIComponent(JSON.stringify(userInfo)));

    return NextResponse.redirect(successUrl);
  } catch (error) {
    // 커스텀 에러 처리
    if (error instanceof OAuthError) {
      logError(error, {
        provider: providerName,
        errorCode: error.code,
      });

      const errorUrl = new URL('/auth/error', process.env.NEXT_PUBLIC_APP_URL!);
      errorUrl.searchParams.set('reason', error.code);
      errorUrl.searchParams.set('provider', providerName);
      errorUrl.searchParams.set('message', error.userMessage);

      return NextResponse.redirect(errorUrl);
    }

    // 예상하지 못한 에러
    logError(error as Error, {
      provider: providerName,
      type: 'unexpected',
    });

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/auth/error?reason=callback_failed&provider=${providerName}`
    );
  }
}
