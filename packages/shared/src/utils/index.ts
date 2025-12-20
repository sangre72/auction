/**
 * 공유 유틸리티 함수
 */

/**
 * 가격을 한국 원화 형식으로 포맷팅
 * @param price - 가격 (숫자)
 * @returns 포맷팅된 가격 문자열 (예: "1,234,567")
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ko-KR').format(price);
}

/**
 * 가격을 원화 통화 형식으로 포맷팅
 * @param price - 가격 (숫자)
 * @returns 포맷팅된 가격 문자열 (예: "₩1,234,567")
 */
export function formatCurrency(price: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(price);
}

/**
 * 숫자를 한국어 형식으로 포맷팅
 * @param num - 숫자
 * @returns 포맷팅된 숫자 문자열 (예: "1,234,567")
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ko-KR').format(num);
}

/**
 * 날짜를 한국어 형식으로 포맷팅
 * @param date - Date 객체 또는 ISO 문자열
 * @param options - 포맷 옵션
 * @returns 포맷팅된 날짜 문자열
 */
export function formatDate(
  date: Date | string,
  options: {
    includeTime?: boolean;
    includeSeconds?: boolean;
  } = {}
): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (options.includeTime) {
    const timeOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      ...(options.includeSeconds && { second: '2-digit' }),
    };
    return new Intl.DateTimeFormat('ko-KR', timeOptions).format(d);
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d);
}

/**
 * 상대적 시간 표시 (예: "3분 전", "1시간 전")
 * @param date - Date 객체 또는 ISO 문자열
 * @returns 상대적 시간 문자열
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay < 7) return `${diffDay}일 전`;

  return formatDate(d);
}

/**
 * 이메일 유효성 검사
 * @param email - 이메일 주소
 * @returns 유효 여부
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * 한국 휴대전화 번호 유효성 검사
 * @param phone - 전화번호
 * @returns 유효 여부
 */
export function isValidPhoneNumber(phone: string): boolean {
  return /^01[0-9]-?\d{3,4}-?\d{4}$/.test(phone);
}

/**
 * 텍스트 자르기 (말줄임)
 * @param text - 원본 텍스트
 * @param maxLength - 최대 길이
 * @returns 잘린 텍스트 (초과 시 ... 추가)
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * 이메일 마스킹
 * @param email - 이메일 주소
 * @returns 마스킹된 이메일 (예: "ab***@example.com")
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const maskedLocal = local.slice(0, 2) + '***';
  return `${maskedLocal}@${domain}`;
}
