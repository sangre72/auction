'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSessionTimeout } from '@auction/shared';
import { SessionTimeoutModal } from '@auction/ui';

// 환경변수에서 타임아웃 설정 (분 단위, 기본값: 15분/3분)
const INACTIVITY_TIMEOUT_MINUTES = Number(process.env.NEXT_PUBLIC_SESSION_INACTIVITY_TIMEOUT) || 15;
const WARNING_TIMEOUT_MINUTES = Number(process.env.NEXT_PUBLIC_SESSION_WARNING_TIMEOUT) || 3;

export function SessionTimeoutProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
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
    router.push('/auth/login');
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
