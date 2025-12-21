/**
 * 보안 관리 API
 */

import type {
  BannedIP,
  SuspiciousActivity,
  SecurityStats,
  BanIPRequest,
  SuccessResponse,
} from '@auction/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

async function fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || 'Request failed');
  }

  return response.json();
}

export const securityApi = {
  // 보안 통계 조회
  getStats: () => fetchWithAuth<SuccessResponse<SecurityStats>>('/security/stats'),

  // 차단된 IP 목록 조회
  getBannedList: () => fetchWithAuth<SuccessResponse<BannedIP[]>>('/security/banned'),

  // 의심 활동 목록 조회
  getSuspiciousList: () => fetchWithAuth<SuccessResponse<SuspiciousActivity[]>>('/security/suspicious'),

  // IP 차단
  banIP: (data: BanIPRequest) =>
    fetchWithAuth<SuccessResponse<BannedIP>>('/security/ban', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // IP 차단 해제
  unbanIP: (ip: string) =>
    fetchWithAuth<SuccessResponse<null>>('/security/unban', {
      method: 'POST',
      body: JSON.stringify({ ip }),
    }),

  // 의심 활동 기록 삭제
  clearSuspicious: (ip: string) =>
    fetchWithAuth<SuccessResponse<null>>(`/security/suspicious/${encodeURIComponent(ip)}`, {
      method: 'DELETE',
    }),

  // 화이트리스트 조회
  getWhitelist: () => fetchWithAuth<SuccessResponse<string[]>>('/security/whitelist'),

  // 화이트리스트 추가
  addToWhitelist: (ip: string) =>
    fetchWithAuth<SuccessResponse<null>>('/security/whitelist', {
      method: 'POST',
      body: JSON.stringify({ ip }),
    }),

  // 화이트리스트 제거
  removeFromWhitelist: (ip: string) =>
    fetchWithAuth<SuccessResponse<null>>(`/security/whitelist/${encodeURIComponent(ip)}`, {
      method: 'DELETE',
    }),

  // 블랙리스트 조회
  getBlacklist: () => fetchWithAuth<SuccessResponse<string[]>>('/security/blacklist'),

  // 블랙리스트 추가 (영구 차단)
  addToBlacklist: (ip: string, reason?: string) =>
    fetchWithAuth<SuccessResponse<null>>('/security/blacklist', {
      method: 'POST',
      body: JSON.stringify({ ip, reason }),
    }),

  // 블랙리스트 제거
  removeFromBlacklist: (ip: string) =>
    fetchWithAuth<SuccessResponse<null>>(`/security/blacklist/${encodeURIComponent(ip)}`, {
      method: 'DELETE',
    }),
};
