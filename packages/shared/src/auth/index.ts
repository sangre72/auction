/**
 * Auth Plugin Module
 *
 * 재사용 가능한 인증 시스템
 * - useAuth: 인증 훅 (팩토리 함수로 생성)
 * - AuthProvider: 설정 Context Provider
 * - OAuth: 소셜 로그인 (Kakao, Naver, Google)
 */

// ============================================================================
// Auth Hook & Provider (Plugin Architecture)
// ============================================================================

export { createUseAuth, useAuth, useAuthConfig, AuthConfigContext } from './useAuth';
export { AuthProvider } from './AuthProvider';

// Re-export auth types
export type {
  BaseUser,
  AuthState,
  UseAuthReturn,
  AuthLoginResponse,
  AuthMeResponse,
  AuthRefreshResponse,
  LoginCredentials,
  RegisterCredentials,
} from '../types/auth';

// ============================================================================
// OAuth 소셜 인증 공통 인터페이스
// ============================================================================

export interface OAuthProvider {
  name: string;
  getAuthorizationUrl(state: string): string;
  getAccessToken(code: string, state?: string): Promise<TokenResponse>;
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

/**
 * CSRF 방지를 위한 랜덤 state 생성
 */
export function generateState(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

/**
 * N8N 웹훅으로 사용자 정보 전송
 */
export async function sendToN8N(userInfo: UserInfo): Promise<void> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('N8N_WEBHOOK_URL not configured, skipping webhook');
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: 'user_login',
        provider: userInfo.provider,
        user: userInfo,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error('Failed to send to N8N:', error);
  }
}

export * from './errors';
export { KakaoOAuthProvider } from './kakao';
export { NaverOAuthProvider } from './naver';
export { GoogleOAuthProvider } from './google';
