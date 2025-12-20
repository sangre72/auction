# 에러 처리 가이드

이 문서는 OAuth 소셜 로그인 모듈의 에러 처리 메커니즘을 설명합니다.

## 개요

모든 가능한 에러 시나리오를 고려하여 견고한 에러 처리를 구현했습니다:

✅ **커스텀 에러 클래스**: 에러 종류별 명확한 분류
✅ **타임아웃 처리**: 10초 타임아웃으로 무한 대기 방지
✅ **재시도 로직**: 네트워크 오류 시 최대 3회 자동 재시도
✅ **사용자 친화적 메시지**: 기술적 에러를 이해하기 쉬운 메시지로 변환
✅ **구조화된 로깅**: 에러 추적 및 디버깅 용이
✅ **OAuth 에러 파라미터 처리**: access_denied 등 표준 OAuth 에러 처리
✅ **응답 검증**: API 응답 구조 검증으로 런타임 에러 방지

## 에러 클래스 계층 구조

### 1. OAuthError (기본 클래스)

모든 OAuth 관련 에러의 부모 클래스입니다.

```typescript
class OAuthError extends Error {
  code: OAuthErrorCode;           // 에러 코드
  details?: unknown;               // 에러 상세 정보
  provider?: string;               // OAuth 제공자
  userMessage: string;             // 사용자에게 표시할 메시지
}
```

### 2. 구체적인 에러 클래스

| 에러 클래스 | 설명 | 사용자 메시지 |
|------------|------|--------------|
| `MissingConfigError` | 환경 변수 누락 | "○○ 로그인 설정이 완료되지 않았습니다" |
| `NetworkError` | 네트워크 연결 오류 | "네트워크 연결에 문제가 있습니다" |
| `TimeoutError` | 요청 시간 초과 | "요청 시간이 초과되었습니다" |
| `TokenRequestError` | 토큰 요청 실패 | "로그인 처리 중 오류가 발생했습니다" |
| `UserInfoError` | 사용자 정보 요청 실패 | "사용자 정보를 가져오는데 실패했습니다" |
| `UserDeniedError` | 사용자가 권한 거부 | "로그인이 취소되었습니다" |
| `InvalidStateError` | CSRF 검증 실패 | "보안 검증에 실패했습니다" |

## 에러 처리 흐름

### 1. OAuth 제공자 레벨

각 OAuth 제공자 클래스(`KakaoOAuthProvider`, `NaverOAuthProvider`, `GoogleOAuthProvider`)에서:

```typescript
async getAccessToken(code: string): Promise<TokenResponse> {
  try {
    // 타임아웃(10초) 및 재시도(3회) 포함 fetch
    const response = await fetchWithRetry(url, options, 3, 10000);

    if (!response.ok) {
      // API 에러 파싱 시도
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        // JSON 파싱 실패 시 기본 에러
        throw new TokenRequestError(provider, response.statusText);
      }

      // OAuth 에러 정보 포함
      throw new TokenRequestError(
        provider,
        errorData.error,
        errorData.error_description
      );
    }

    const data = await response.json();

    // 응답 검증
    if (!data.access_token) {
      throw new TokenRequestError(provider, 'invalid_response', ...);
    }

    return data;
  } catch (error) {
    // 에러 종류별 처리
    if (error instanceof TokenRequestError) {
      throw error;
    }

    if ((error as Error).message.includes('timeout')) {
      throw new TimeoutError(provider);
    }

    // 구조화된 로깅
    logError(error, { provider, method: 'getAccessToken' });

    throw new NetworkError(...);
  }
}
```

### 2. API Route 레벨

`/api/auth/callback`에서:

```typescript
export async function GET(request: NextRequest) {
  // 1. OAuth 에러 파라미터 확인
  const oauthError = searchParams.get('error');

  if (oauthError === 'access_denied') {
    // 사용자 거부
    return redirectToError('user_denied');
  }

  // 2. CSRF 검증
  if (state !== savedState) {
    logError(new InvalidStateError(), { ... });
    return redirectToError('invalid_state');
  }

  try {
    // 3. OAuth 플로우 실행
    const tokenResponse = await provider.getAccessToken(code, state);
    const userInfo = await provider.getUserInfo(tokenResponse.access_token);

    // 성공
    return redirectToSuccess(userInfo);
  } catch (error) {
    // 4. 커스텀 에러 처리
    if (error instanceof OAuthError) {
      logError(error, { provider, errorCode: error.code });

      // 에러 정보와 함께 리다이렉트
      return redirectToError(error.code, error.userMessage);
    }

    // 5. 예상치 못한 에러
    logError(error, { provider, type: 'unexpected' });
    return redirectToError('callback_failed');
  }
}
```

### 3. 사용자 인터페이스 레벨

에러 페이지(`/auth/error`)에서:

```typescript
// URL 파라미터에서 에러 정보 추출
const reason = searchParams.get('reason');
const provider = searchParams.get('provider');
const customMessage = searchParams.get('message');

// 사용자에게 친화적인 메시지 표시
const errorInfo = errorMessages[reason] || {
  title: '오류 발생',
  message: customMessage || '알 수 없는 오류가 발생했습니다.',
  action: '다시 시도해주세요.',
};
```

## 타임아웃 및 재시도 메커니즘

### fetchWithTimeout

```typescript
async function fetchWithTimeout(
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
```

### fetchWithRetry

```typescript
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  timeoutMs: number = 10000
): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fetchWithTimeout(url, options, timeoutMs);
    } catch (error) {
      const isRetryable =
        error.message.includes('timeout') ||
        error.message.includes('network') ||
        error.message.includes('ECONNRESET');

      if (!isRetryable || attempt === maxRetries - 1) {
        throw error;
      }

      // 지수 백오프: 1초, 2초, 4초
      const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

## 로깅 시스템

### 구조화된 로깅

```typescript
function logError(error: Error | OAuthError, context?: Record<string, unknown>) {
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

  // 개발 환경: 읽기 쉬운 형식
  if (process.env.NODE_ENV === 'development') {
    console.error('OAuth Error:', JSON.stringify(errorInfo, null, 2));
  } else {
    // 프로덕션: JSON 형식 (로그 수집 도구용)
    console.error(JSON.stringify(errorInfo));
  }

  // 에러 모니터링 서비스 통합 (선택사항)
  // if (process.env.SENTRY_DSN) {
  //   Sentry.captureException(error, { contexts: { oauth: context } });
  // }
}
```

### 로그 예시

```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "error": {
    "name": "TokenRequestError",
    "message": "Token request failed: Invalid authorization code",
    "code": "TOKEN_REQUEST_FAILED",
    "provider": "kakao",
    "details": {
      "error": "invalid_grant",
      "error_description": "Invalid authorization code"
    }
  },
  "context": {
    "provider": "kakao",
    "method": "getAccessToken"
  },
  "stack": "TokenRequestError: Token request failed...\n    at..."
}
```

## 에러 시나리오별 처리

### 1. 환경 변수 누락

**시나리오**: `KAKAO_CLIENT_ID`가 설정되지 않음

```typescript
// 에러 발생
throw new MissingConfigError(['KAKAO_CLIENT_ID'], 'Kakao');

// 사용자에게 표시
// 제목: "설정 오류"
// 메시지: "카카오 로그인 설정이 완료되지 않았습니다."
// 액션: "관리자에게 문의해주세요."
```

### 2. 네트워크 오류

**시나리오**: 인터넷 연결 끊김

```typescript
// 3회 재시도 후 실패
throw new NetworkError('Failed to fetch', 'Kakao');

// 사용자에게 표시
// 제목: "네트워크 오류"
// 메시지: "네트워크 연결에 문제가 있습니다."
// 액션: "인터넷 연결을 확인하고 다시 시도해주세요."
```

### 3. 타임아웃

**시나리오**: OAuth 서버 응답 느림 (10초 초과)

```typescript
// AbortController로 요청 취소
throw new TimeoutError('Naver');

// 사용자에게 표시
// 제목: "시간 초과"
// 메시지: "요청 시간이 초과되었습니다."
// 액션: "잠시 후 다시 시도해주세요."
```

### 4. 사용자 권한 거부

**시나리오**: 사용자가 동의 화면에서 "취소" 클릭

```typescript
// URL: /api/auth/callback?error=access_denied&provider=google

// 에러 감지
if (oauthError === 'access_denied') {
  throw new UserDeniedError('Google');
}

// 사용자에게 표시
// 제목: "로그인 취소"
// 메시지: "구글 로그인이 취소되었습니다."
// 액션: "다시 로그인하시려면 아래 버튼을 클릭하세요."
```

### 5. 잘못된 인가 코드

**시나리오**: 인가 코드가 이미 사용되었거나 만료됨

```typescript
// OAuth 서버 응답: { error: "invalid_grant", error_description: "..." }

throw new TokenRequestError('Kakao', 'invalid_grant', 'Authorization code expired');

// 사용자에게 표시
// 제목: "인증 실패"
// 메시지: "카카오 인증 토큰을 받는데 실패했습니다."
// 액션: "다시 시도하거나 관리자에게 문의해주세요."
```

### 6. CSRF 검증 실패

**시나리오**: state 파라미터 불일치

```typescript
if (state !== savedState) {
  throw new InvalidStateError();
}

// 사용자에게 표시
// 제목: "보안 검증 실패"
// 메시지: "CSRF 검증에 실패했습니다."
// 액션: "홈페이지로 돌아가서 다시 로그인해주세요."
```

### 7. API 응답 구조 오류

**시나리오**: 예상하지 못한 API 응답 형식

```typescript
// 검증 실패
if (!data.access_token) {
  throw new TokenRequestError(
    'Google',
    'invalid_response',
    'Access token not found in response'
  );
}

// 또는

if (!data.id) {
  throw new UserInfoError('Naver', 200, {
    error: 'Invalid response',
    details: 'User ID not found in response',
  });
}
```

## 에러 모니터링 통합 (선택사항)

### Sentry 통합 예시

```typescript
// src/lib/auth/errors.ts
import * as Sentry from '@sentry/nextjs';

export function logError(error: Error | OAuthError, context?: Record<string, unknown>) {
  // 기존 로깅...

  // Sentry로 전송
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureException(error, {
      tags: {
        module: 'oauth',
        ...(error instanceof OAuthError && {
          oauth_provider: error.provider,
          oauth_code: error.code,
        }),
      },
      contexts: {
        oauth: context,
      },
    });
  }
}
```

### DataDog 통합 예시

```typescript
import { datadogLogs } from '@datadog/browser-logs';

export function logError(error: Error | OAuthError, context?: Record<string, unknown>) {
  // 기존 로깅...

  // DataDog로 전송
  if (process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN) {
    datadogLogs.logger.error('OAuth Error', {
      error: {
        kind: error.name,
        message: error.message,
        stack: error.stack,
      },
      ...(error instanceof OAuthError && {
        oauth: {
          code: error.code,
          provider: error.provider,
          details: error.details,
        },
      }),
      ...context,
    });
  }
}
```

## 테스트

### 에러 시나리오 테스트

```typescript
// 환경 변수 누락 테스트
test('should throw MissingConfigError when CLIENT_ID is missing', () => {
  delete process.env.KAKAO_CLIENT_ID;
  expect(() => new KakaoOAuthProvider()).toThrow(MissingConfigError);
});

// 타임아웃 테스트
test('should throw TimeoutError after 10 seconds', async () => {
  // Mock slow API
  fetchMock.mockResponseOnce(async () => {
    await new Promise(resolve => setTimeout(resolve, 11000));
    return JSON.stringify({ access_token: 'test' });
  });

  await expect(provider.getAccessToken('code')).rejects.toThrow(TimeoutError);
});

// 네트워크 오류 테스트
test('should retry 3 times on network error', async () => {
  fetchMock
    .mockRejectOnce(new Error('Network error'))
    .mockRejectOnce(new Error('Network error'))
    .mockResolvedOnce({ ok: true, json: async () => ({ access_token: 'test' }) });

  const result = await provider.getAccessToken('code');
  expect(result.access_token).toBe('test');
  expect(fetchMock).toHaveBeenCalledTimes(3);
});
```

## 베스트 프랙티스

### 1. 항상 특정 에러 클래스 사용

❌ **나쁜 예**:
```typescript
throw new Error('Failed to get token');
```

✅ **좋은 예**:
```typescript
throw new TokenRequestError('Kakao', 'invalid_grant', 'Authorization code expired');
```

### 2. 충분한 컨텍스트 정보 로깅

❌ **나쁜 예**:
```typescript
console.error(error);
```

✅ **좋은 예**:
```typescript
logError(error, {
  provider: 'kakao',
  method: 'getAccessToken',
  code: code.substring(0, 10) + '...', // 민감 정보 마스킹
});
```

### 3. 사용자 친화적 메시지

❌ **나쁜 예**:
```typescript
"HTTP 401: Unauthorized"
```

✅ **좋은 예**:
```typescript
"로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요."
```

### 4. 민감 정보 보호

❌ **나쁜 예**:
```typescript
logError(error, {
  access_token: tokenResponse.access_token,
  client_secret: this.clientSecret,
});
```

✅ **좋은 예**:
```typescript
logError(error, {
  token_prefix: tokenResponse.access_token.substring(0, 10) + '...',
  has_client_secret: !!this.clientSecret,
});
```

## 문제 해결

### 에러 로그를 찾을 수 없음

**원인**: 로그 레벨이 너무 높음

**해결**:
```bash
# 개발 환경에서 모든 로그 표시
NODE_ENV=development npm run dev
```

### 재시도가 작동하지 않음

**원인**: 에러가 재시도 가능하지 않음으로 분류됨

**해결**: `fetchWithRetry`의 `isRetryable` 조건 확인

```typescript
const isRetryable =
  error.message.includes('timeout') ||
  error.message.includes('network') ||
  error.message.includes('ECONNRESET') ||
  error.message.includes('ETIMEDOUT'); // 추가
```

### 에러 메시지가 너무 기술적임

**원인**: `error.message` 대신 `error.userMessage` 사용 필요

**해결**:
```typescript
// 에러 페이지에서
errorUrl.searchParams.set('message', error.userMessage); // ✅
// errorUrl.searchParams.set('message', error.message); // ❌
```

## 추가 리소스

- [OAuth 2.0 RFC 6749 - Error Response](https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.2.1)
- [MDN - AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [Next.js Error Handling](https://nextjs.org/docs/advanced-features/error-handling)
