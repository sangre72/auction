/**
 * 세션 타임아웃 관련 타입 정의
 */

// ============================================
// 설정 타입
// ============================================

export interface SessionTimeoutConfig {
  /** 비활동 타임아웃 (밀리초, 기본: 15분) */
  inactivityTimeout: number;
  /** 경고 카운트다운 시간 (밀리초, 기본: 3분) */
  warningTimeout: number;
  /** 활동으로 감지할 이벤트 목록 */
  activityEvents: (keyof WindowEventMap)[];
}

// ============================================
// 상태 타입
// ============================================

export interface SessionTimeoutState {
  /** 경고 모달 표시 여부 */
  isWarningVisible: boolean;
  /** 남은 시간 (초) */
  remainingSeconds: number;
  /** 로그아웃 완료 모달 표시 여부 */
  isLogoutCompleteVisible: boolean;
}

// ============================================
// 훅 옵션 및 반환 타입
// ============================================

export interface UseSessionTimeoutOptions {
  /** 커스텀 설정 (선택사항) */
  config?: Partial<SessionTimeoutConfig>;
  /** 세션 연장 시 콜백 */
  onExtend?: () => void;
  /** 로그아웃 시 콜백 (필수) */
  onLogout: () => Promise<void>;
  /** 현재 인증 상태 */
  isAuthenticated: boolean;
}

export interface UseSessionTimeoutReturn extends SessionTimeoutState {
  /** 세션 연장 (타이머 리셋) */
  extendSession: () => void;
  /** 즉시 로그아웃 */
  logout: () => void;
  /** 로그아웃 완료 모달 닫기 */
  dismissLogoutComplete: () => void;
}
