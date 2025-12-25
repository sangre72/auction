/**
 * 인증 훅 (User App)
 *
 * @auction/shared의 플러그인 아키텍처를 사용하여 생성
 * httpOnly 쿠키 기반 인증 (XSS 방지)
 */

import { createUseAuth, createAuthConfig } from '@auction/shared';
import type { UserProfile } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * User App 전용 인증 설정
 */
const userAuthConfig = createAuthConfig({
  apiUrl: API_URL,
  endpoints: {
    login: '/user/auth/login',
    logout: '/user/auth/logout',
    refresh: '/user/auth/refresh',
    me: '/user/auth/me',
    register: '/user/auth/register',
  },
  tokenRefresh: {
    enabled: true,
    thresholdSeconds: 300, // 5분 전 갱신
    autoRefresh: true,
  },
});

/**
 * User App 전용 useAuth 훅
 * UserProfile 타입으로 생성
 */
export const useAuth = createUseAuth<UserProfile>(userAuthConfig);
