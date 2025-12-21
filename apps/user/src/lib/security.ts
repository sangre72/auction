/**
 * 보안 관련 프론트엔드 처리
 */

import {
  SecurityBlockResponse,
  isSecurityBlockResponse,
  getSecurityErrorMessage,
  SecurityErrorCode,
} from '@auction/shared';

// 차단 상태 저장
let isBlocked = false;
let blockUntil: Date | null = null;
let blockReason: string | null = null;

// 차단 상태 확인
export function checkBlocked(): { blocked: boolean; message: string | null; retryAfter: number | null } {
  if (!isBlocked || !blockUntil) {
    return { blocked: false, message: null, retryAfter: null };
  }

  const now = new Date();
  if (now >= blockUntil) {
    // 차단 해제
    isBlocked = false;
    blockUntil = null;
    blockReason = null;
    return { blocked: false, message: null, retryAfter: null };
  }

  const retryAfter = Math.ceil((blockUntil.getTime() - now.getTime()) / 1000);
  return { blocked: true, message: blockReason, retryAfter };
}

// 차단 설정
export function setBlocked(code: SecurityErrorCode, reason: string, retryAfterSeconds?: number) {
  isBlocked = true;
  blockReason = reason;

  if (retryAfterSeconds) {
    blockUntil = new Date(Date.now() + retryAfterSeconds * 1000);
  } else {
    // 기본 60초
    blockUntil = new Date(Date.now() + 60 * 1000);
  }

  // 콘솔 경고
  console.warn(`[Security] Blocked: ${code} - ${reason}`);
}

// 차단 해제
export function clearBlocked() {
  isBlocked = false;
  blockUntil = null;
  blockReason = null;
}

// API 응답 처리
export async function handleSecurityResponse(response: Response): Promise<{
  blocked: boolean;
  data?: SecurityBlockResponse;
}> {
  // 차단 관련 상태 코드
  if (response.status === 403 || response.status === 429) {
    try {
      const data = await response.json();

      if (isSecurityBlockResponse(data)) {
        const message = getSecurityErrorMessage(data.error.code);
        setBlocked(data.error.code, message, data.error.retry_after);

        return { blocked: true, data };
      }
    } catch {
      // JSON 파싱 실패 시 기본 처리
      if (response.status === 429) {
        setBlocked('RATE_LIMITED', '요청이 너무 많습니다.', 60);
        return { blocked: true };
      }
    }
  }

  return { blocked: false };
}

// 차단 시 표시할 컴포넌트용 훅 데이터
export function getBlockStatus() {
  const status = checkBlocked();
  return {
    isBlocked: status.blocked,
    message: status.message,
    retryAfter: status.retryAfter,
    formattedRetryAfter: status.retryAfter
      ? formatRetryAfter(status.retryAfter)
      : null,
  };
}

function formatRetryAfter(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}초`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (remainingSeconds === 0) {
    return `${minutes}분`;
  }
  return `${minutes}분 ${remainingSeconds}초`;
}
