/**
 * 사용자 ID 관리
 * (실제로는 인증 시스템에서 가져와야 함)
 */

const USER_ID_KEY = 'auction_user_id';

export function getUserId(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  let userId = localStorage.getItem(USER_ID_KEY);

  if (!userId) {
    // 임시 사용자 ID 생성 (실제로는 로그인 후 할당)
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(USER_ID_KEY, userId);
  }

  return userId;
}

export function setUserId(id: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_ID_KEY, id);
  }
}

export function clearUserId(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_ID_KEY);
  }
}
