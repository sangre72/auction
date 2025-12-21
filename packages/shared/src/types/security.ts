/**
 * 보안 관련 타입 정의
 */

// 차단 에러 코드
export type SecurityErrorCode =
  | 'IP_BLACKLISTED'      // IP 블랙리스트
  | 'IP_BANNED'           // IP 자동 차단
  | 'RATE_LIMITED'        // 요청 제한 초과
  | 'SECURITY_VIOLATION'  // 보안 위반 (공격 감지)
  | 'BAD_REQUEST';        // 잘못된 요청

// 차단 응답 타입
export interface SecurityBlockResponse {
  success: false;
  error: {
    code: SecurityErrorCode;
    reason: string;
    blocked: true;
    retry_after?: number;  // 초 단위
  };
}

// 차단 여부 확인
export function isSecurityBlockResponse(data: unknown): data is SecurityBlockResponse {
  if (typeof data !== 'object' || data === null) return false;

  const obj = data as Record<string, unknown>;
  if (obj.success !== false) return false;

  const error = obj.error as Record<string, unknown> | undefined;
  if (!error || typeof error !== 'object') return false;

  return error.blocked === true && typeof error.code === 'string';
}

// 사용자 친화적 메시지 변환
export function getSecurityErrorMessage(code: SecurityErrorCode): string {
  switch (code) {
    case 'IP_BLACKLISTED':
      return '접근이 차단되었습니다. 관리자에게 문의하세요.';
    case 'IP_BANNED':
      return '일시적으로 접근이 차단되었습니다. 잠시 후 다시 시도해주세요.';
    case 'RATE_LIMITED':
      return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
    case 'SECURITY_VIOLATION':
      return '보안 정책에 의해 차단되었습니다.';
    case 'BAD_REQUEST':
      return '잘못된 요청입니다.';
    default:
      return '요청을 처리할 수 없습니다.';
  }
}

// ============================================
// 관리자용 보안 관리 타입
// ============================================

// 차단 유형
export type BanType = 'auto' | 'manual' | 'blacklist';

// 차단된 IP 정보
export interface BannedIP {
  ip: string;
  ban_type: BanType;
  reason: string;
  banned_at: string;
  ban_until: string | null;
  is_permanent: boolean;
  remaining_seconds: number | null;
  suspicious_count: number;
  last_attack_type: string | null;
}

// 의심 활동 정보
export interface SuspiciousActivity {
  ip: string;
  count: number;
  first_seen: string | null;
  last_seen: string | null;
  attack_types: string[];
}

// 보안 통계
export interface SecurityStats {
  total_banned: number;
  permanent_banned: number;
  temporary_banned: number;
  suspicious_ips: number;
  whitelist_count: number;
  blacklist_count: number;
}

// IP 차단 요청
export interface BanIPRequest {
  ip: string;
  reason: string;
  duration_seconds?: number; // undefined면 영구 차단
}

// 차단 유형 표시 텍스트
export function getBanTypeLabel(type: BanType): string {
  switch (type) {
    case 'auto':
      return '자동 차단';
    case 'manual':
      return '수동 차단';
    case 'blacklist':
      return '블랙리스트';
    default:
      return '알 수 없음';
  }
}

// 공격 유형 표시 텍스트
export function getAttackTypeLabel(type: string | null): string {
  if (!type) return '-';
  switch (type) {
    case 'sql_injection':
      return 'SQL Injection';
    case 'xss':
      return 'XSS';
    case 'path_traversal':
      return 'Path Traversal';
    case 'command_injection':
      return 'Command Injection';
    case 'rate_limit':
      return 'Rate Limit 초과';
    default:
      return type;
  }
}
