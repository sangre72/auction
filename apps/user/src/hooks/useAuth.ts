/**
 * 인증 훅
 * httpOnly 쿠키 기반 인증 (XSS 방지)
 * 토큰은 서버에서 쿠키로 관리하므로 클라이언트에서 직접 접근하지 않습니다.
 */

import { useState, useEffect, useCallback } from 'react';
import type { AuthState, UseAuthReturn } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // 인증 상태 확인 (쿠키 기반)
  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/user/auth/me`, {
        credentials: 'include', // 쿠키 포함
      });

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
  }, []);

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
