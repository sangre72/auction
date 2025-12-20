# 코딩 가이드라인

이 문서는 프로젝트의 일관성을 유지하기 위한 코딩 규칙과 베스트 프랙티스를 정의합니다.

## 목차

1. [TypeScript 규칙](#typescript-규칙)
2. [React/Next.js 규칙](#reactnextjs-규칙)
3. [에러 처리](#에러-처리)
4. [네이밍 컨벤션](#네이밍-컨벤션)
5. [파일 구조](#파일-구조)
6. [주석 및 문서화](#주석-및-문서화)
7. [보안 규칙](#보안-규칙)
8. [성능 최적화](#성능-최적화)
9. [테스트](#테스트)
10. [Git 커밋 메시지](#git-커밋-메시지)

## TypeScript 규칙

### 1. 타입 안정성

```typescript
// ✅ 명시적 타입 선언
function getUser(id: string): Promise<User> {
  return fetchUser(id);
}

// ❌ any 사용 금지
function getUser(id: any): any {
  return fetchUser(id);
}

// ✅ unknown 사용 (필요시)
function parseJSON(json: string): unknown {
  return JSON.parse(json);
}
```

### 2. 인터페이스 vs 타입

```typescript
// ✅ 확장 가능한 경우 interface 사용
export interface OAuthProvider {
  name: string;
  getAccessToken(code: string): Promise<TokenResponse>;
}

// ✅ Union, Intersection 등 복잡한 타입은 type 사용
export type OAuthErrorCode =
  | 'MISSING_CONFIG'
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR';

// ✅ 함수 타입
export type LogFunction = (message: string, context?: Record<string, unknown>) => void;
```

### 3. 제네릭

```typescript
// ✅ 재사용 가능한 유틸리티
function fetchWithRetry<T>(
  fetcher: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  // ...
}

// 사용
const user = await fetchWithRetry<User>(() => getUser('123'));
```

### 4. Strict Mode

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

### 5. Null 안전성

```typescript
// ✅ Optional chaining
const email = data.kakao_account?.email;

// ✅ Nullish coalescing
const name = data.name ?? 'Unknown';

// ❌ 직접 접근
const email = data.kakao_account.email; // 에러 가능
```

## React/Next.js 규칙

### 1. 컴포넌트 구조

```typescript
// ✅ 함수형 컴포넌트 사용
export default function SocialLoginButtons() {
  const handleLogin = (provider: string) => {
    window.location.href = `/api/auth/${provider}`;
  };

  return (
    <div className="flex flex-col gap-3">
      <button onClick={() => handleLogin('kakao')}>
        카카오로 계속하기
      </button>
    </div>
  );
}

// ❌ 클래스 컴포넌트 (레거시)
class SocialLoginButtons extends React.Component {
  // ...
}
```

### 2. Hooks 규칙

```typescript
// ✅ 최상위 레벨에서만 호출
export default function Component() {
  const [state, setState] = useState(0);
  const value = useMemo(() => expensiveComputation(), []);

  return <div>{value}</div>;
}

// ❌ 조건문 안에서 호출 금지
export default function Component({ show }: Props) {
  if (show) {
    const [state, setState] = useState(0); // ❌
  }
}
```

### 3. Server vs Client 컴포넌트

```typescript
// ✅ Server Component (기본)
// app/page.tsx
export default function HomePage() {
  // 서버에서만 실행
  const data = await fetchData();
  return <div>{data}</div>;
}

// ✅ Client Component (필요시)
// components/SocialLoginButtons.tsx
'use client';

export default function SocialLoginButtons() {
  // 클라이언트 측 상호작용 필요
  const handleClick = () => { };
  return <button onClick={handleClick}>Login</button>;
}
```

### 4. API Routes

```typescript
// ✅ 명확한 HTTP 메서드
export async function GET(request: NextRequest) {
  // GET 요청 처리
}

export async function POST(request: NextRequest) {
  // POST 요청 처리
}

// ❌ 단일 핸들러로 모든 메서드 처리
export default async function handler(req: NextRequest) {
  if (req.method === 'GET') { } // ❌
  if (req.method === 'POST') { } // ❌
}
```

## 에러 처리

### 1. 커스텀 에러 사용

```typescript
// ✅ 커스텀 에러 클래스
throw new TokenRequestError('Kakao', 'invalid_grant', 'Code expired');

// ❌ 일반 Error
throw new Error('Token request failed');
```

### 2. Try-Catch 범위

```typescript
// ✅ 특정 작업만 감싸기
async function fetchData() {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    logError(error as Error);
    throw new NetworkError('Failed to fetch', 'Provider');
  }
}

// ❌ 너무 넓은 범위
async function doEverything() {
  try {
    // 100줄의 코드...
  } catch (error) {
    // 어떤 에러인지 알 수 없음
  }
}
```

### 3. 에러 로깅

```typescript
// ✅ 구조화된 로깅
logError(error, {
  provider: 'kakao',
  method: 'getAccessToken',
  code: code.substring(0, 10) + '...', // 민감 정보 마스킹
});

// ❌ console.error만 사용
console.error(error);
```

## 네이밍 컨벤션

### 1. 변수 및 함수

```typescript
// ✅ camelCase
const accessToken = 'token';
const refreshToken = 'refresh';

function getUserInfo() { }
function handleLogin() { }

// ❌ snake_case, PascalCase (변수)
const access_token = 'token'; // ❌
const AccessToken = 'token'; // ❌
```

### 2. 상수

```typescript
// ✅ UPPER_SNAKE_CASE
const MAX_RETRIES = 3;
const DEFAULT_TIMEOUT = 10000;
const OAUTH_PROVIDERS = ['kakao', 'naver', 'google'] as const;

// ❌ camelCase
const maxRetries = 3; // ❌
```

### 3. 타입/인터페이스/클래스

```typescript
// ✅ PascalCase
interface OAuthProvider { }
type TokenResponse = { };
class KakaoOAuthProvider { }

// ❌ camelCase
interface oAuthProvider { } // ❌
```

### 4. 컴포넌트

```typescript
// ✅ PascalCase
export default function SocialLoginButtons() { }

// ❌ camelCase
export default function socialLoginButtons() { } // ❌
```

### 5. 파일명

```typescript
// ✅ kebab-case (설정 파일)
// next.config.ts
// tailwind.config.ts

// ✅ camelCase (유틸리티)
// src/lib/auth/fetchWithRetry.ts

// ✅ PascalCase (컴포넌트)
// src/components/SocialLoginButtons.tsx

// ✅ 소문자 (Next.js 규약)
// src/app/page.tsx
// src/app/layout.tsx
```

### 6. Boolean 변수

```typescript
// ✅ is, has, should 접두사
const isLoading = true;
const hasError = false;
const shouldRetry = true;

// ❌ 모호한 이름
const loading = true; // ❌
const error = false; // ❌
```

### 7. 함수명

```typescript
// ✅ 동사로 시작
function fetchData() { }
function validateToken() { }
function handleLogin() { }
function createProvider() { }

// ❌ 명사로 시작
function data() { } // ❌
function token() { } // ❌
```

## 파일 구조

### 1. Import 순서

```typescript
// 1. React/Next.js
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// 2. 외부 라이브러리
import axios from 'axios';

// 3. 내부 모듈 (@/로 시작)
import { KakaoOAuthProvider } from '@/lib/auth/kakao';
import { OAuthError, logError } from '@/lib/auth/errors';

// 4. 타입 (별도 그룹)
import type { OAuthProvider } from '@/lib/auth';
import type { User } from '@/types';

// 5. 스타일 (마지막)
import styles from './styles.module.css';
```

### 2. Export 패턴

```typescript
// ✅ Named export (유틸리티, 클래스)
export class KakaoOAuthProvider { }
export function fetchWithRetry() { }
export const MAX_RETRIES = 3;

// ✅ Default export (컴포넌트, 페이지)
export default function HomePage() { }

// ❌ 혼합 사용 (혼란 야기)
export class Foo { }
export default Foo; // ❌ 둘 중 하나만
```

### 3. 파일 크기

```typescript
// ✅ 200줄 이하 권장
// 300줄 이상이면 분리 고려

// 예: 너무 큰 파일
// src/lib/auth/providers.ts (500줄)

// ✅ 분리
// src/lib/auth/kakao.ts (100줄)
// src/lib/auth/naver.ts (100줄)
// src/lib/auth/google.ts (100줄)
```

## 주석 및 문서화

### 1. JSDoc

```typescript
/**
 * 카카오 OAuth 2.0 구현
 * @see https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api
 */
export class KakaoOAuthProvider implements OAuthProvider {
  /**
   * 인가 코드로 액세스 토큰 받기
   * @param code OAuth 인가 코드
   * @returns 액세스 토큰 및 메타데이터
   * @throws {TokenRequestError} 토큰 요청 실패 시
   * @throws {TimeoutError} 요청 시간 초과 시
   */
  async getAccessToken(code: string): Promise<TokenResponse> {
    // ...
  }
}
```

### 2. 주석 원칙

```typescript
// ✅ Why (왜)를 설명
// CSRF 방지를 위해 state 검증 필수
if (state !== savedState) {
  throw new InvalidStateError();
}

// ❌ What (무엇)을 설명 (코드가 이미 설명함)
// state가 savedState와 같은지 확인
if (state !== savedState) { } // ❌
```

### 3. TODO 주석

```typescript
// ✅ TODO 형식
// TODO: 데이터베이스 연동 추가 필요 (@username, 2024-12-20)
// FIXME: 네트워크 오류 시 무한 재시도 버그
// HACK: 임시 해결책, 나중에 리팩토링 필요

// ❌ 모호한 주석
// 나중에 고치기
// 이거 이상함
```

## 보안 규칙

### 1. 환경 변수

```typescript
// ✅ 환경 변수 검증
constructor() {
  if (!process.env.KAKAO_CLIENT_ID) {
    throw new MissingConfigError(['KAKAO_CLIENT_ID'], 'Kakao');
  }
}

// ❌ 검증 없이 사용
const clientId = process.env.KAKAO_CLIENT_ID!; // ❌ 런타임 에러 가능
```

### 2. 민감 정보 로깅 금지

```typescript
// ✅ 마스킹 처리
logError(error, {
  token_prefix: token.substring(0, 10) + '...',
  has_client_secret: !!clientSecret,
});

// ❌ 전체 노출
logError(error, {
  access_token: token, // ❌
  client_secret: clientSecret, // ❌
});
```

### 3. SQL Injection 방지

```typescript
// ✅ Parameterized query
const user = await db.query(
  'SELECT * FROM users WHERE id = $1',
  [userId]
);

// ❌ String concatenation
const user = await db.query(
  `SELECT * FROM users WHERE id = '${userId}'` // ❌
);
```

### 4. XSS 방지

```typescript
// ✅ React는 기본적으로 escape
<div>{userInput}</div>

// ❌ dangerouslySetInnerHTML 사용 금지 (필요 시 sanitize)
<div dangerouslySetInnerHTML={{ __html: userInput }} /> // ❌

// ✅ Sanitize 후 사용
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

## 성능 최적화

### 1. 메모이제이션

```typescript
// ✅ 비용이 큰 계산은 useMemo
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);

// ✅ 콜백은 useCallback
const handleClick = useCallback(() => {
  doSomething(value);
}, [value]);
```

### 2. 동적 import

```typescript
// ✅ 필요할 때만 로드
const DynamicComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
});

// ❌ 항상 로드
import HeavyComponent from './HeavyComponent'; // ❌
```

### 3. 이미지 최적화

```typescript
// ✅ Next.js Image 컴포넌트
import Image from 'next/image';

<Image
  src={profileImage}
  alt="Profile"
  width={100}
  height={100}
  loading="lazy"
/>

// ❌ img 태그
<img src={profileImage} alt="Profile" /> // ❌
```

## 테스트

### 1. 테스트 구조

```typescript
describe('KakaoOAuthProvider', () => {
  describe('getAccessToken', () => {
    it('should return access token on success', async () => {
      // Arrange
      const provider = new KakaoOAuthProvider();
      const code = 'test-code';

      // Act
      const result = await provider.getAccessToken(code);

      // Assert
      expect(result.access_token).toBeDefined();
    });

    it('should throw TokenRequestError on failure', async () => {
      // ...
    });
  });
});
```

### 2. 테스트 네이밍

```typescript
// ✅ should + 동작 설명
it('should throw error when CLIENT_ID is missing', () => { });
it('should retry 3 times on network error', () => { });

// ❌ 모호한 설명
it('test error', () => { }); // ❌
it('works', () => { }); // ❌
```

### 3. Mock 사용

```typescript
// ✅ 외부 의존성 Mock
jest.mock('node-fetch');

it('should handle network error', async () => {
  (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

  await expect(provider.getAccessToken('code')).rejects.toThrow(NetworkError);
});
```

## Git 커밋 메시지

### 1. 커밋 메시지 형식

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 2. Type

- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 포맷팅 (기능 변경 없음)
- `refactor`: 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드, 설정 변경

### 3. 예시

```bash
# ✅ 좋은 예
feat(oauth): add Facebook OAuth provider

Implement FacebookOAuthProvider with the same interface as
other providers. Includes error handling and retry logic.

Closes #123

# ✅ 좋은 예
fix(auth): handle expired authorization code

Add proper error handling for expired codes and return
user-friendly error message.

# ❌ 나쁜 예
update files  # 너무 모호함
fix bug      # 무슨 버그인지 불명확
아ㅏㅏㅏ      # 의미 없음
```

### 4. 커밋 크기

```bash
# ✅ 작은 단위로 커밋
git commit -m "feat(oauth): add Facebook provider class"
git commit -m "feat(oauth): add Facebook to provider registry"
git commit -m "docs(oauth): add Facebook setup guide"

# ❌ 너무 큰 커밋
git commit -m "add everything for Facebook"  # 100개 파일 변경
```

## 코드 리뷰 체크리스트

### Pull Request 작성자

- [ ] 코딩 가이드라인 준수
- [ ] 테스트 작성 및 통과
- [ ] 문서 업데이트 (필요시)
- [ ] Breaking change 확인
- [ ] 성능 영향 평가
- [ ] 보안 이슈 검토

### 리뷰어

- [ ] 코드가 요구사항 충족
- [ ] 테스트 커버리지 적절
- [ ] 에러 처리 적절
- [ ] 성능 이슈 없음
- [ ] 보안 취약점 없음
- [ ] 가독성 양호

## 자동화 도구

### 1. ESLint

```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "no-console": ["warn", { "allow": ["error", "warn"] }]
  }
}
```

### 2. Prettier

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### 3. Husky (Pre-commit hooks)

```bash
# .husky/pre-commit
npm run lint
npm run type-check
npm run test
```

## 참고 자료

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Next.js Best Practices](https://nextjs.org/docs/getting-started)
- [React Hooks Rules](https://react.dev/reference/react/hooks#rules-of-hooks)
- [Clean Code by Robert C. Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
