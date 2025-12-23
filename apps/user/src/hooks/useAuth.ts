/**
 * 인증 훅
 * httpOnly 쿠키 기반 인증 (XSS 방지)
 * 토큰은 서버에서 쿠키로 관리하므로 클라이언트에서 직접 접근하지 않습니다.
 * Access Token 만료 시 Refresh Token으로 자동 갱신합니다.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { AuthState, UseAuthReturn } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // 토큰 갱신 중복 방지
  const isRefreshingRef = useRef(false);

  // 토큰 갱신
  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (isRefreshingRef.current) return false;

    isRefreshingRef.current = true;
    try {
      const response = await fetch(`${API_URL}/user/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      return response.ok;
    } catch {
      return false;
    } finally {
      isRefreshingRef.current = false;
    }
  }, []);

  // 인증 상태 확인 (쿠키 기반)
  const checkAuth = useCallback(async () => {
    try {
      let response = await fetch(`${API_URL}/user/auth/me`, {
        credentials: 'include', // 쿠키 포함
      });

      // 401 에러 시 토큰 갱신 시도
      if (response.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
          // 재시도
          response = await fetch(`${API_URL}/user/auth/me`, {
            credentials: 'include',
          });
        }
      }

      if (response.ok) {
        const data = await response.json();
        setState({
          user: data.data,
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
  }, [refreshToken]);

  // 초기 로드 시 인증 상태 확인
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 로그인 (서버에서 httpOnly 쿠키 설정)
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/user/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // 쿠키 수신
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setState({
          user: data.data.user,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  // 로그아웃 (서버에서 쿠키 삭제)
  const logout = useCallback(async () => {
    try {
      await fetch(`${API_URL}/user/auth/logout`, {
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
  }, []);

  return {
    ...state,
    login,
    logout,
    checkAuth,
  };
}
