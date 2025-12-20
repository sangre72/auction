# 프로젝트 아키텍처

이 문서는 OAuth 소셜 로그인 모듈의 아키텍처, 설계 원칙, 패턴을 설명합니다.

## 목차

1. [개요](#개요)
2. [아키텍처 원칙](#아키텍처-원칙)
3. [레이어 아키텍처](#레이어-아키텍처)
4. [디자인 패턴](#디자인-패턴)
5. [모듈 구조](#모듈-구조)
6. [확장 가이드](#확장-가이드)
7. [보안 설계](#보안-설계)

## 개요

### 시스템 구성

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ UI Components│  │  API Routes  │  │   OAuth Lib  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────┐
│              OAuth Providers (External)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  Kakao   │  │  Naver   │  │  Google  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────┐
│                Backend (FastAPI) - Optional              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Routers    │  │   Services   │  │    Models    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────┐
│                    Integrations                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │   N8N    │  │ Database │  │  Sentry  │             │
│  └──────────┘  └──────────┘  └──────────┘             │
└─────────────────────────────────────────────────────────┘
```

## 아키텍처 원칙

### 1. SOLID 원칙

#### Single Responsibility Principle (단일 책임 원칙)
- 각 클래스는 하나의 책임만 가짐
- `KakaoOAuthProvider`는 카카오 OAuth만 처리
- `logError`는 로깅만 담당

#### Open/Closed Principle (개방/폐쇄 원칙)
- 새로운 OAuth 제공자 추가 시 기존 코드 수정 불필요
- `OAuthProvider` 인터페이스를 구현하여 확장

```typescript
// 기존 코드 수정 없이 새 제공자 추가
export class FacebookOAuthProvider implements OAuthProvider {
  // 구현...
}

// 사용처에서 자동으로 동작
const providers = {
  kakao: KakaoOAuthProvider,
  naver: NaverOAuthProvider,
  google: GoogleOAuthProvider,
  facebook: FacebookOAuthProvider, // 추가만 하면 됨
};
```

#### Liskov Substitution Principle (리스코프 치환 원칙)
- 모든 `OAuthProvider` 구현체는 교체 가능
- 동일한 인터페이스로 동작 보장

#### Interface Segregation Principle (인터페이스 분리 원칙)
- 최소한의 인터페이스만 요구
- `OAuthProvider`는 3개 메서드만 필수

#### Dependency Inversion Principle (의존성 역전 원칙)
- 구체적인 구현이 아닌 인터페이스에 의존
- `callback route`는 구체적 제공자가 아닌 `OAuthProvider` 인터페이스 사용

### 2. DRY (Don't Repeat Yourself)

```typescript
// ❌ 나쁜 예: 코드 중복
async getAccessToken(code: string) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error();
  // ...
}

// ✅ 좋은 예: 공통 로직 추출
async getAccessToken(code: string) {
  const response = await fetchWithRetry(url, options, 3, 10000);
  // ...
}
```

### 3. Separation of Concerns (관심사 분리)

```
UI Layer (Components)
    ↓ 사용자 액션
API Layer (Routes)
    ↓ OAuth 플로우
Service Layer (Providers)
    ↓ 외부 API 호출
Infrastructure Layer (Errors, Logging)
```

### 4. Fail Fast

```typescript
// 환경 변수 검증을 생성자에서 즉시 수행
constructor() {
  if (!this.clientId) {
    throw new MissingConfigError(['KAKAO_CLIENT_ID'], 'Kakao');
  }
}
```

## 레이어 아키텍처

### 1. Presentation Layer (프레젠테이션 계층)

**위치**: `src/components/`, `src/app/(pages)`

**책임**:
- 사용자 인터페이스
- 사용자 입력 처리
- 에러 메시지 표시

**규칙**:
- 비즈니스 로직 포함 금지
- API 직접 호출 금지
- 상태 관리는 최소화

**예시**:
```typescript
// ✅ 올바른 컴포넌트
export default function SocialLoginButtons() {
  const handleLogin = (provider: string) => {
    window.location.href = `/api/auth/${provider}`;
  };

  return <button onClick={() => handleLogin('kakao')}>카카오 로그인</button>;
}

// ❌ 잘못된 컴포넌트
export default function SocialLoginButtons() {
  const handleLogin = async (provider: string) => {
    // 비즈니스 로직을 컴포넌트에 직접 구현 (X)
    const oauth = new KakaoOAuthProvider();
    const token = await oauth.getAccessToken(code);
    // ...
  };
}
```

### 2. API Layer (API 계층)

**위치**: `src/app/api/`

**책임**:
- HTTP 요청/응답 처리
- 라우팅
- 인증/인가
- 에러 핸들링

**규칙**:
- 얇은 레이어 유지
- 비즈니스 로직은 Service Layer로 위임
- 요청 검증 및 응답 변환

**예시**:
```typescript
export async function GET(request: NextRequest) {
  // 1. 요청 파라미터 추출
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  // 2. 검증
  if (!code || state !== savedState) {
    return redirectToError('invalid_state');
  }

  // 3. Service Layer 호출
  const provider = new KakaoOAuthProvider();
  const userInfo = await provider.getUserInfo(token);

  // 4. 응답 변환
  return NextResponse.redirect(successUrl);
}
```

### 3. Service Layer (서비스 계층)

**위치**: `src/lib/auth/`

**책임**:
- 비즈니스 로직
- OAuth 플로우 구현
- 외부 API 통신

**규칙**:
- HTTP 세부사항 몰라도 됨
- 재사용 가능한 단위
- 명확한 인터페이스 정의

**예시**:
```typescript
export class KakaoOAuthProvider implements OAuthProvider {
  async getAccessToken(code: string): Promise<TokenResponse> {
    // OAuth 토큰 요청 로직
  }

  async getUserInfo(accessToken: string): Promise<UserInfo> {
    // 사용자 정보 요청 로직
  }
}
```

### 4. Infrastructure Layer (인프라 계층)

**위치**: `src/lib/auth/errors.ts`

**책임**:
- 에러 처리
- 로깅
- 네트워크 유틸리티
- 모니터링

**규칙**:
- 비즈니스 로직 독립적
- 재사용 가능한 유틸리티
- 설정 기반 동작

## 디자인 패턴

### 1. Strategy Pattern (전략 패턴)

OAuth 제공자별로 다른 전략을 사용합니다.

```typescript
interface OAuthProvider {
  getAuthorizationUrl(state: string): string;
  getAccessToken(code: string): Promise<TokenResponse>;
  getUserInfo(accessToken: string): Promise<UserInfo>;
}

// 전략 구현
class KakaoOAuthProvider implements OAuthProvider { }
class NaverOAuthProvider implements OAuthProvider { }
class GoogleOAuthProvider implements OAuthProvider { }

// 런타임에 전략 선택
const provider = new providers[providerName]();
```

**장점**:
- 새 제공자 추가 시 기존 코드 수정 불필요
- 각 제공자의 고유 로직 캡슐화
- 테스트 용이

### 2. Factory Pattern (팩토리 패턴)

제공자 인스턴스 생성을 중앙화합니다.

```typescript
const providers = {
  kakao: KakaoOAuthProvider,
  naver: NaverOAuthProvider,
  google: GoogleOAuthProvider,
};

function createOAuthProvider(name: string): OAuthProvider {
  const ProviderClass = providers[name];
  if (!ProviderClass) {
    throw new Error(`Invalid provider: ${name}`);
  }
  return new ProviderClass();
}
```

### 3. Template Method Pattern (템플릿 메서드 패턴)

공통 OAuth 플로우를 템플릿화합니다.

```typescript
// 추상 템플릿 (향후 리팩토링 시)
abstract class AbstractOAuthProvider {
  async authenticate(code: string): Promise<UserInfo> {
    // 1. 토큰 받기 (구현체별 다름)
    const token = await this.getAccessToken(code);

    // 2. 토큰 검증 (공통)
    this.validateToken(token);

    // 3. 사용자 정보 받기 (구현체별 다름)
    const userInfo = await this.getUserInfo(token.access_token);

    // 4. 정보 검증 (공통)
    this.validateUserInfo(userInfo);

    return userInfo;
  }

  abstract getAccessToken(code: string): Promise<TokenResponse>;
  abstract getUserInfo(token: string): Promise<UserInfo>;

  protected validateToken(token: TokenResponse) { }
  protected validateUserInfo(info: UserInfo) { }
}
```

### 4. Error Hierarchy Pattern (에러 계층 패턴)

에러를 계층적으로 구조화합니다.

```typescript
OAuthError (기본)
  ├─ MissingConfigError
  ├─ NetworkError
  │   ├─ TimeoutError
  │   └─ ConnectionError
  ├─ TokenRequestError
  ├─ UserInfoError
  └─ InvalidStateError
```

### 5. Retry Pattern (재시도 패턴)

네트워크 오류 시 자동 재시도합니다.

```typescript
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3
): Promise<Response> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fetchWithTimeout(url, options);
    } catch (error) {
      if (!isRetryable(error) || attempt === maxRetries - 1) {
        throw error;
      }
      await delay(Math.pow(2, attempt) * 1000); // 지수 백오프
    }
  }
}
```

## 모듈 구조

### 디렉토리 구조 규칙

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트만
│   │   └── auth/
│   │       ├── [provider]/route.ts    # 동적 라우트
│   │       └── callback/route.ts
│   └── (pages)/           # UI 페이지
│       ├── page.tsx
│       └── auth/
│           ├── success/page.tsx
│           └── error/page.tsx
├── components/            # 재사용 가능한 UI 컴포넌트
│   └── SocialLoginButtons.tsx
└── lib/                   # 비즈니스 로직 및 유틸리티
    └── auth/
        ├── index.ts       # 공통 인터페이스
        ├── errors.ts      # 에러 클래스
        ├── kakao.ts       # 카카오 구현
        ├── naver.ts       # 네이버 구현
        └── google.ts      # 구글 구현
```

### 파일 명명 규칙

| 타입 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 | PascalCase | `SocialLoginButtons.tsx` |
| 유틸리티 | camelCase | `fetchWithRetry.ts` |
| 타입/인터페이스 | PascalCase | `OAuthProvider` |
| 상수 | UPPER_SNAKE_CASE | `MAX_RETRIES` |
| 라우트 | kebab-case | `[provider]/route.ts` |

### Import 순서

```typescript
// 1. 외부 라이브러리
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

// 2. 내부 모듈 (@/로 시작)
import { KakaoOAuthProvider } from '@/lib/auth/kakao';
import { OAuthError } from '@/lib/auth/errors';

// 3. 상대 경로
import { config } from './config';

// 4. 타입 (별도)
import type { OAuthProvider } from '@/lib/auth';
```

## 확장 가이드

### 새 OAuth 제공자 추가하기

1. **제공자 클래스 생성**

```typescript
// src/lib/auth/facebook.ts
import type { OAuthProvider, TokenResponse, UserInfo } from './index';
import {
  MissingConfigError,
  NetworkError,
  TimeoutError,
  TokenRequestError,
  UserInfoError,
  logError,
  fetchWithRetry,
} from './errors';

export class FacebookOAuthProvider implements OAuthProvider {
  name = 'facebook';

  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.FACEBOOK_CLIENT_ID || '';
    this.clientSecret = process.env.FACEBOOK_CLIENT_SECRET || '';
    this.redirectUri = process.env.FACEBOOK_REDIRECT_URI || '';

    const missingVars: string[] = [];
    if (!this.clientId) missingVars.push('FACEBOOK_CLIENT_ID');
    if (!this.clientSecret) missingVars.push('FACEBOOK_CLIENT_SECRET');
    if (!this.redirectUri) missingVars.push('FACEBOOK_REDIRECT_URI');

    if (missingVars.length > 0) {
      throw new MissingConfigError(missingVars, 'Facebook');
    }
  }

  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'email,public_profile',
      state,
    });

    return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
  }

  async getAccessToken(code: string): Promise<TokenResponse> {
    try {
      const response = await fetchWithRetry(
        'https://graph.facebook.com/v18.0/oauth/access_token',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: this.clientId,
            client_secret: this.clientSecret,
            code,
            redirect_uri: this.redirectUri,
          }),
        },
        3,
        10000
      );

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          throw new TokenRequestError('Facebook', response.statusText);
        }

        throw new TokenRequestError(
          'Facebook',
          errorData.error?.type || 'unknown',
          errorData.error?.message
        );
      }

      const data = await response.json();

      if (!data.access_token) {
        throw new TokenRequestError(
          'Facebook',
          'invalid_response',
          'Access token not found in response'
        );
      }

      return data;
    } catch (error) {
      if (error instanceof TokenRequestError) throw error;
      if ((error as Error).message.includes('timeout')) {
        throw new TimeoutError('Facebook');
      }

      logError(error as Error, { provider: 'facebook', method: 'getAccessToken' });
      throw new NetworkError((error as Error).message, 'Facebook', { originalError: error });
    }
  }

  async getUserInfo(accessToken: string): Promise<UserInfo> {
    try {
      const response = await fetchWithRetry(
        `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`,
        {},
        3,
        10000
      );

      if (!response.ok) {
        throw new UserInfoError('Facebook', response.status, {
          statusText: response.statusText,
        });
      }

      const data = await response.json();

      if (!data.id) {
        throw new UserInfoError('Facebook', 200, {
          error: 'Invalid response',
          details: 'User ID not found in response',
        });
      }

      return {
        id: data.id,
        email: data.email,
        name: data.name,
        profileImage: data.picture?.data?.url,
        provider: 'facebook',
      };
    } catch (error) {
      if (error instanceof UserInfoError) throw error;
      if ((error as Error).message.includes('timeout')) {
        throw new TimeoutError('Facebook');
      }

      logError(error as Error, { provider: 'facebook', method: 'getUserInfo' });
      throw new NetworkError((error as Error).message, 'Facebook', { originalError: error });
    }
  }
}
```

2. **라우트에 등록**

```typescript
// src/app/api/auth/[provider]/route.ts
import { FacebookOAuthProvider } from '@/lib/auth/facebook';

const providers = {
  kakao: KakaoOAuthProvider,
  naver: NaverOAuthProvider,
  google: GoogleOAuthProvider,
  facebook: FacebookOAuthProvider, // 추가
};
```

3. **환경 변수 추가**

```bash
# .env.local
FACEBOOK_CLIENT_ID=your_app_id
FACEBOOK_CLIENT_SECRET=your_app_secret
FACEBOOK_REDIRECT_URI=http://localhost:3000/api/auth/callback?provider=facebook
```

4. **테스트**

```bash
npm run dev
# http://localhost:3000 방문
# 페이스북 로그인 버튼 클릭
```

### 새 기능 추가 패턴

#### 1. 토큰 갱신 기능 추가

```typescript
// src/lib/auth/index.ts에 인터페이스 확장
export interface OAuthProvider {
  // 기존...
  refreshToken?(refreshToken: string): Promise<TokenResponse>; // 선택적 메서드
}

// 각 제공자에서 구현
export class KakaoOAuthProvider implements OAuthProvider {
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    // 구현...
  }
}
```

#### 2. 프로필 업데이트 기능

```typescript
// src/lib/auth/index.ts
export interface OAuthProvider {
  // 기존...
  updateProfile?(accessToken: string, data: Partial<UserInfo>): Promise<UserInfo>;
}
```

## 보안 설계

### 1. Defense in Depth (다층 방어)

```
User Input
    ↓ [검증 레이어 1] 클라이언트 측 검증
API Route
    ↓ [검증 레이어 2] CSRF 토큰 검증
Service Layer
    ↓ [검증 레이어 3] API 응답 검증
Database
    ↓ [검증 레이어 4] 데이터 무결성 검증
```

### 2. Principle of Least Privilege (최소 권한 원칙)

```typescript
// OAuth 스코프를 필요한 것만 요청
getAuthorizationUrl(state: string): string {
  const params = new URLSearchParams({
    scope: 'openid profile email', // 필요한 것만
    // scope: 'openid profile email calendar contacts', // ❌ 과도한 권한
  });
}
```

### 3. Secure by Default (기본적으로 안전)

```typescript
// 쿠키 설정
cookies().set('oauth_state', state, {
  httpOnly: true,                              // XSS 방지
  secure: process.env.NODE_ENV === 'production', // HTTPS only
  sameSite: 'lax',                             // CSRF 방지
  maxAge: 60 * 10,                             // 10분 후 만료
});
```

### 4. 민감 정보 보호

```typescript
// ❌ 로그에 민감 정보 노출
logError(error, {
  access_token: token,
  client_secret: secret,
});

// ✅ 마스킹 처리
logError(error, {
  token_prefix: token.substring(0, 10) + '...',
  has_client_secret: !!secret,
});
```

## 테스트 전략

### 1. 단위 테스트

```typescript
// src/lib/auth/__tests__/kakao.test.ts
describe('KakaoOAuthProvider', () => {
  it('should throw MissingConfigError when CLIENT_ID is missing', () => {
    delete process.env.KAKAO_CLIENT_ID;
    expect(() => new KakaoOAuthProvider()).toThrow(MissingConfigError);
  });

  it('should generate correct authorization URL', () => {
    const provider = new KakaoOAuthProvider();
    const url = provider.getAuthorizationUrl('test-state');
    expect(url).toContain('https://kauth.kakao.com/oauth/authorize');
    expect(url).toContain('state=test-state');
  });
});
```

### 2. 통합 테스트

```typescript
// src/app/api/auth/__tests__/callback.test.ts
describe('OAuth Callback API', () => {
  it('should handle successful authentication', async () => {
    const response = await GET(mockRequest);
    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toContain('/auth/success');
  });
});
```

### 3. E2E 테스트

```typescript
// e2e/oauth.spec.ts
test('complete OAuth flow', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click('button:has-text("카카오로 계속하기")');
  // 카카오 로그인 페이지에서 로그인
  await page.fill('#id_email_2', 'test@example.com');
  await page.fill('#id_password_3', 'password');
  await page.click('button[type="submit"]');
  // 성공 페이지 확인
  await expect(page).toHaveURL(/\/auth\/success/);
});
```

## 성능 최적화

### 1. 병렬 처리

```typescript
// ❌ 순차 처리
const token = await getAccessToken(code);
const userInfo = await getUserInfo(token);

// ✅ 가능한 경우 병렬 처리
const [config, cache] = await Promise.all([
  fetchConfig(),
  fetchCache(),
]);
```

### 2. 캐싱

```typescript
// 제공자 메타데이터 캐싱
const PROVIDER_CACHE = new Map();

function getProviderMetadata(name: string) {
  if (PROVIDER_CACHE.has(name)) {
    return PROVIDER_CACHE.get(name);
  }

  const metadata = loadMetadata(name);
  PROVIDER_CACHE.set(name, metadata);
  return metadata;
}
```

### 3. 리소스 정리

```typescript
// 타임아웃 정리
const timeoutId = setTimeout(() => controller.abort(), 10000);
try {
  const response = await fetch(url, { signal: controller.signal });
  return response;
} finally {
  clearTimeout(timeoutId); // 반드시 정리
}
```

## 모니터링 및 관찰성

### 1. 로깅 레벨

```typescript
enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>) {
  const logEntry = {
    level,
    timestamp: new Date().toISOString(),
    message,
    ...context,
  };

  if (level === LogLevel.ERROR) {
    console.error(JSON.stringify(logEntry));
  } else {
    console.log(JSON.stringify(logEntry));
  }
}
```

### 2. 메트릭 수집

```typescript
// 성공/실패율 추적
const metrics = {
  oauth_attempts_total: 0,
  oauth_success_total: 0,
  oauth_error_total: 0,
};

function recordMetric(event: string, provider: string) {
  metrics[`${event}_total`]++;
  // Prometheus, DataDog 등으로 전송
}
```

## 참고 자료

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [OAuth 2.0 Security Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-security-topics)
- [Next.js App Router Documentation](https://nextjs.org/docs/app)
