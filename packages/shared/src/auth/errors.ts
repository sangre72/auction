/**
 * OAuth 인증 에러 클래스들
 */

export enum OAuthErrorCode {
  // 환경 변수 관련
  MISSING_CONFIG = 'MISSING_CONFIG',

  // CSRF 관련
  INVALID_STATE = 'INVALID_STATE',
  MISSING_STATE = 'MISSING_STATE',

  // OAuth 제공자 관련
  INVALID_PROVIDER = 'INVALID_PROVIDER',
  PROVIDER_ERROR = 'PROVIDER_ERROR',

  // 토큰 관련
  TOKEN_REQUEST_FAILED = 'TOKEN_REQUEST_FAILED',
  INVALID_TOKEN_RESPONSE = 'INVALID_TOKEN_RESPONSE',

  // 사용자 정보 관련
  USER_INFO_FAILED = 'USER_INFO_FAILED',
  INVALID_USER_RESPONSE = 'INVALID_USER_RESPONSE',

  // 네트워크 관련
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',

  // 사용자 행동
  USER_DENIED = 'USER_DENIED',

  // 기타
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * OAuth 에러 기본 클래스
 */
export class OAuthError extends Error {
  code: OAuthErrorCode;
  details?: unknown;
  provider?: string;
  userMessage: string;

  constructor(
    code: OAuthErrorCode,
    message: string,
    userMessage: string,
    details?: unknown,
    provider?: string
  ) {
    super(message);
    this.name = 'OAuthError';
    this.code = code;
    this.userMessage = userMessage;
    this.details = details;
    this.provider = provider;

    // TypeScript에서 Error를 확장할 때 필요
    Object.setPrototypeOf(this, OAuthError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      provider: this.provider,
      details: this.details,
    };
  }
}

/**
 * 환경 변수 누락 에러
 */
export class MissingConfigError extends OAuthError {
  constructor(missingVars: string[], provider: string) {
    super(
      OAuthErrorCode.MISSING_CONFIG,
      `Missing environment variables: ${missingVars.join(', ')}`,
      `${provider} 로그인 설정이 완료되지 않았습니다. 관리자에게 문의하세요.`,
      { missingVars },
      provider
    );
    this.name = 'MissingConfigError';
  }
}

/**
 * 네트워크 에러
 */
export class NetworkError extends OAuthError {
  constructor(message: string, provider: string, details?: unknown) {
    super(
      OAuthErrorCode.NETWORK_ERROR,
      message,
      '네트워크 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.',
      details,
      provider
    );
    this.name = 'NetworkError';
  }
}

/**
 * 타임아웃 에러
 */
export class TimeoutError extends OAuthError {
  constructor(provider: string) {
    super(
      OAuthErrorCode.TIMEOUT_ERROR,
      `Request to ${provider} timed out`,
      '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.',
      undefined,
      provider
    );
    this.name = 'TimeoutError';
  }
}

/**
 * 토큰 요청 실패
 */
export class TokenRequestError extends OAuthError {
  constructor(provider: string, error: string, errorDescription?: string) {
    super(
      OAuthErrorCode.TOKEN_REQUEST_FAILED,
      `Token request failed: ${errorDescription || error}`,
      '로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.',
      { error, error_description: errorDescription },
      provider
    );
    this.name = 'TokenRequestError';
  }
}

/**
 * 사용자 정보 요청 실패
 */
export class UserInfoError extends OAuthError {
  constructor(provider: string, statusCode: number, details?: Record<string, unknown>) {
    super(
      OAuthErrorCode.USER_INFO_FAILED,
      `Failed to fetch user info: HTTP ${statusCode}`,
      '사용자 정보를 가져오는데 실패했습니다. 다시 시도해주세요.',
      { statusCode, ...(details || {}) },
      provider
    );
    this.name = 'UserInfoError';
  }
}

/**
 * 사용자 로그인 거부
 */
export class UserDeniedError extends OAuthError {
  constructor(provider: string) {
    super(
      OAuthErrorCode.USER_DENIED,
      'User denied authorization',
      '로그인이 취소되었습니다.',
      undefined,
      provider
    );
    this.name = 'UserDeniedError';
  }
}

/**
 * CSRF 검증 실패
 */
export class InvalidStateError extends OAuthError {
  constructor() {
    super(
      OAuthErrorCode.INVALID_STATE,
      'CSRF validation failed: state mismatch',
      '보안 검증에 실패했습니다. 처음부터 다시 시도해주세요.'
    );
    this.name = 'InvalidStateError';
  }
}

/**
 * 에러 로깅 유틸리티
 */
export function logError(error: Error | OAuthError, context?: Record<string, unknown>) {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    error: {
      name: error.name,
      message: error.message,
      ...(error instanceof OAuthError && {
        code: error.code,
        provider: error.provider,
        details: error.details,
      }),
    },
    context,
    stack: error.stack,
  };

  // 개발 환경에서는 콘솔에 출력
  if (process.env.NODE_ENV === 'development') {
    console.error('OAuth Error:', JSON.stringify(errorInfo, null, 2));
  } else {
    // 프로덕션에서는 구조화된 로그
    console.error(JSON.stringify(errorInfo));
  }
}

/**
 * fetch 요청을 타임아웃과 함께 실행
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 10000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    if ((error as Error).name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

/**
 * 재시도 로직을 포함한 fetch
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  timeoutMs: number = 10000
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fetchWithTimeout(url, options, timeoutMs);
    } catch (error) {
      lastError = error as Error;

      // 재시도 가능한 에러인지 확인
      const isRetryable =
        lastError.message.includes('timeout') ||
        lastError.message.includes('network') ||
        lastError.message.includes('ECONNRESET');

      if (!isRetryable || attempt === maxRetries - 1) {
        throw lastError;
      }

      // 지수 백오프
      const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Request failed after retries');
}
