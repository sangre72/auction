'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionTimeout } from '@auction/shared';
import { SessionTimeoutModal } from '@auction/ui';

// 환경변수에서 타임아웃 설정 (분 단위, 기본값: 15분/3분)
const INACTIVITY_TIMEOUT_MINUTES = Number(process.env.NEXT_PUBLIC_SESSION_INACTIVITY_TIMEOUT) || 15;
const WARNING_TIMEOUT_MINUTES = Number(process.env.NEXT_PUBLIC_SESSION_WARNING_TIMEOUT) || 3;

export function SessionTimeoutProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // localStorage에서 인증 상태 확인
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    setIsAuthenticated(!!token);

    // storage 이벤트 감지 (다른 탭에서 로그아웃 시)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'admin_token') {
        setIsAuthenticated(!!e.newValue);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      localStorage.removeItem('admin_token');
      setIsAuthenticated(false);
      router.push('/login');
    }
  };

  const {
    isWarningVisible,
    isLogoutCompleteVisible,
    remainingSeconds,
    extendSession,
    logout: triggerLogout,
    dismissLogoutComplete,
  } = useSessionTimeout({
    isAuthenticated,
    onLogout: handleLogout,
    config: {
      inactivityTimeout: INACTIVITY_TIMEOUT_MINUTES * 60 * 1000,
      warningTimeout: WARNING_TIMEOUT_MINUTES * 60 * 1000,
    },
  });

  const handleDismiss = () => {
    dismissLogoutComplete();
    router.push('/login');
  };

  return (
    <>
      {children}
      <SessionTimeoutModal
        isWarningOpen={isWarningVisible}
        isLogoutCompleteOpen={isLogoutCompleteVisible}
        remainingSeconds={remainingSeconds}
        inactivityMinutes={INACTIVITY_TIMEOUT_MINUTES}
        onExtend={extendSession}
        onLogout={triggerLogout}
        onDismiss={handleDismiss}
      />
    </>
  );
}
