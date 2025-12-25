'use client';

/**
 * 재사용 가능한 인증 훅 팩토리
 *
 * httpOnly 쿠키 기반 인증 (XSS 방지)
 * 토큰은 서버에서 쿠키로 관리하므로 클라이언트에서 직접 접근하지 않습니다.
 * Access Token 만료 시 Refresh Token으로 자동 갱신합니다.
 *
 * @example
 * // 기본 설정 사용
 * const useAuth = createUseAuth();
 *
 * // 커스텀 설정
 * const useAuth = createUseAuth<MyUser>(createAuthConfig({
 *   apiUrl: 'https://api.myapp.com',
 *   endpoints: { login: '/auth/signin' },
 * }));
 */

import { useState, useEffect, useCallback, useRef, useContext, createContext } from 'react';
import type { AuthConfig } from '../config';
import { createAuthConfig } from '../config';
import type { BaseUser, AuthState, UseAuthReturn } from '../types/auth';

// ============================================================================
// Auth Context
// ============================================================================

export const AuthConfigContext = createContext<AuthConfig | null>(null);

/**
 * 현재 Auth 설정을 가져오는 훅
 */
export function useAuthConfig(): AuthConfig {
  const context = useContext(AuthConfigContext);
  if (!context) {
    // Context가 없으면 기본 설정 사용
    return createAuthConfig();
  }
  return context;
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * useAuth 훅 팩토리 함수
 *
 * @template TUser - 사용자 타입 (BaseUser 확장)
 * @param config - 인증 설정 (optional, 없으면 기본값 사용)
 * @returns useAuth 훅
 *
 * @example
 * // 타입 지정
 * interface MyUser extends BaseUser {
 *   role: 'admin' | 'user';
 * }
 * const useAuth = createUseAuth<MyUser>();
 *
 * // 커스텀 엔드포인트
 * const useAuth = createUseAuth(createAuthConfig({
 *   endpoints: { me: '/api/v2/me' }
 * }));
 */
export function createUseAuth<TUser extends BaseUser = BaseUser>(
  config?: AuthConfig
) {
  return function useAuth(): UseAuthReturn<TUser> {
    const contextConfig = useAuthConfig();
    const finalConfig = config || contextConfig;

    const [state, setState] = useState<AuthState<TUser>>({
      user: null,
      isAuthenticated: false,
      isLoading: true,
    });

    // 토큰 갱신 중복 방지
    const isRefreshingRef = useRef(false);

    // 토큰 갱신
    const refreshToken = useCallback(async (): Promise<boolean> => {
      if (isRefreshingRef.current) return false;
      if (!finalConfig.tokenRefresh.enabled) return false;

      isRefreshingRef.current = true;
      try {
        const response = await fetch(`${finalConfig.apiUrl}${finalConfig.endpoints.refresh}`, {
          method: 'POST',
          credentials: 'include',
        });
        return response.ok;
      } catch {
        return false;
      } finally {
        isRefreshingRef.current = false;
      }
    }, [finalConfig]);

    // 인증 상태 확인 (쿠키 기반)
    const checkAuth = useCallback(async () => {
      try {
        let response = await fetch(`${finalConfig.apiUrl}${finalConfig.endpoints.me}`, {
          credentials: 'include', // 쿠키 포함
        });

        // 401 에러 시 토큰 갱신 시도
        if (response.status === 401) {
          const refreshed = await refreshToken();
          if (refreshed) {
            // 재시도
            response = await fetch(`${finalConfig.apiUrl}${finalConfig.endpoints.me}`, {
              credentials: 'include',
            });
          }
        }

        if (response.ok) {
          const data = await response.json();
          setState({
            user: data.data as TUser,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    }, [finalConfig, refreshToken]);

    // 초기 로드 시 인증 상태 확인
    useEffect(() => {
      checkAuth();
    }, [checkAuth]);

    // 로그인 (서버에서 httpOnly 쿠키 설정)
    const login = useCallback(async (email: string, password: string): Promise<boolean> => {
      try {
        const response = await fetch(`${finalConfig.apiUrl}${finalConfig.endpoints.login}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // 쿠키 수신
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const data = await response.json();
          setState({
            user: data.data.user as TUser,
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        }
        return false;
      } catch {
        return false;
      }
    }, [finalConfig]);

    // 로그아웃 (서버에서 쿠키 삭제)
    const logout = useCallback(async () => {
      try {
        await fetch(`${finalConfig.apiUrl}${finalConfig.endpoints.logout}`, {
          method: 'POST',
          credentials: 'include',
        });
      } finally {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    }, [finalConfig]);

    return {
      ...state,
      login,
      logout,
      checkAuth,
    };
  };
}

// ============================================================================
// Default Export (하위 호환성)
// ============================================================================

/**
 * 기본 설정으로 생성된 useAuth 훅
 * 기존 코드와 하위 호환성 유지
 */
export const useAuth = createUseAuth<BaseUser>();
