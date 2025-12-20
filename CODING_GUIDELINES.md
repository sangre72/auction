# 코딩 가이드라인

이 문서는 프로젝트의 일관성을 유지하기 위한 코딩 규칙과 베스트 프랙티스를 정의합니다.

## 목차

1. [TypeScript 규칙](#typescript-규칙)
2. [React/Next.js 규칙](#reactnextjs-규칙)
3. [에러 처리](#에러-처리)
4. [네이밍 컨벤션](#네이밍-컨벤션)
5. [파일 구조](#파일-구조)
6. [모듈화 가이드라인](#모듈화-가이드라인)
7. [주석 및 문서화](#주석-및-문서화)
8. [보안 규칙](#보안-규칙)
9. [성능 최적화](#성능-최적화)
10. [테스트](#테스트)
11. [Git 커밋 메시지](#git-커밋-메시지)

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

## 모듈화 가이드라인

> **핵심 원칙**: 프론트엔드 모듈은 **디렉토리 단위로 독립적으로 이동 가능**해야 합니다.
> 공용 유틸리티는 **@auction/shared** 패키지에 배치합니다.

### 1. 모노레포 구조

```
auction-001/
├── apps/                    # 애플리케이션
│   ├── admin/               # 관리자 앱
│   └── user/                # 사용자 앱
├── packages/                # 공유 패키지
│   ├── shared/              # 공유 로직 및 타입
│   │   ├── src/
│   │   │   ├── types/       # 공유 타입 정의
│   │   │   ├── utils/       # 공유 유틸리티
│   │   │   └── auth/        # 공유 인증 로직
│   │   └── package.json
│   ├── ui/                  # 공유 UI 컴포넌트
│   │   ├── src/components/
│   │   └── package.json
│   └── typescript-config/   # 공유 TypeScript 설정
└── backend/                 # Python FastAPI 백엔드
```

### 2. 프론트엔드 모듈 독립성 규칙

각 기능 모듈은 **디렉토리 하나를 통째로 이동**해도 동작해야 합니다.

#### 2.1 기능 모듈 구조 (Feature Module)

```
apps/admin/src/
├── features/                # ✅ 기능별 모듈 (권장)
│   ├── products/            # 상품 관리 모듈
│   │   ├── components/      # 모듈 전용 컴포넌트
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   └── ProductPreview.tsx
│   │   ├── hooks/           # 모듈 전용 훅
│   │   │   └── useProducts.ts
│   │   ├── api/             # 모듈 전용 API 함수
│   │   │   └── productsApi.ts
│   │   ├── types/           # 모듈 전용 타입
│   │   │   └── product.types.ts
│   │   ├── utils/           # 모듈 전용 유틸리티
│   │   │   └── productHelpers.ts
│   │   └── index.ts         # 모듈 public API
│   ├── users/               # 사용자 관리 모듈
│   ├── payments/            # 결제 관리 모듈
│   └── banners/             # 배너 관리 모듈
├── components/              # 앱 전역 공유 컴포넌트
│   ├── layout/
│   └── ui/
├── lib/                     # 앱 전역 유틸리티
│   ├── api.ts               # API 클라이언트 설정
│   └── auth/                # 앱 인증 관련
└── app/                     # Next.js App Router (페이지)
    └── (dashboard)/
        └── products/
            └── page.tsx     # features/products 사용
```

#### 2.2 모듈 독립성 체크리스트

```typescript
// ✅ 올바른 모듈 구조 (자체 포함)
// features/products/index.ts
export { ProductCard } from './components/ProductCard';
export { ProductForm } from './components/ProductForm';
export { useProducts } from './hooks/useProducts';
export { productsApi } from './api/productsApi';
export type { Product, ProductFormData } from './types/product.types';

// 페이지에서 사용
// app/(dashboard)/products/page.tsx
import { ProductCard, useProducts } from '@/features/products';

// ❌ 잘못된 구조 (모듈 간 직접 참조)
import { formatPrice } from '../payments/utils/formatPrice'; // ❌
// → 공용 유틸이면 @auction/shared로 이동
```

#### 2.3 모듈 간 의존성 규칙

```
┌─────────────────────────────────────────────────────────┐
│                    @auction/shared                       │
│  (types, utils, auth - 모든 앱에서 사용)                  │
└─────────────────────────────────────────────────────────┘
                           ▲
                           │ import
┌─────────────────────────────────────────────────────────┐
│                    @auction/ui                           │
│  (공유 UI 컴포넌트 - Button, Card, Table 등)             │
└─────────────────────────────────────────────────────────┘
                           ▲
                           │ import
┌─────────────────────────────────────────────────────────┐
│                  apps/admin/src/lib                      │
│  (앱 전역 설정 - API 클라이언트, 앱 공용 유틸)            │
└─────────────────────────────────────────────────────────┘
                           ▲
                           │ import
┌─────────────────────────────────────────────────────────┐
│                apps/admin/src/features/*                 │
│  (기능 모듈 - 각 모듈은 서로 직접 참조 금지)              │
└─────────────────────────────────────────────────────────┘
                           ▲
                           │ import
┌─────────────────────────────────────────────────────────┐
│                 apps/admin/src/app/*                     │
│  (페이지 - features에서 필요한 것만 import)              │
└─────────────────────────────────────────────────────────┘
```

**규칙**:
- 기능 모듈(features/*)은 서로 직접 import 금지
- 공유 필요 시 → `@auction/shared` 또는 `src/lib`로 이동
- 하위 레이어는 상위 레이어를 알지 못함

### 3. 공용 유틸리티 배치 규칙

#### 3.1 @auction/shared에 배치할 것

**2개 이상의 앱 또는 모듈**에서 사용되면 `@auction/shared`로 이동:

```typescript
// packages/shared/src/utils/index.ts

// ✅ 문자열 처리
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  return local.slice(0, 2) + '***@' + domain;
}

// ✅ 숫자/가격 포맷팅
export function formatPrice(price: number, currency = 'KRW'): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency,
  }).format(price);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ko-KR').format(num);
}

// ✅ 날짜 포맷팅
export function formatDate(date: Date | string, format = 'YYYY-MM-DD'): string {
  // ...
}

export function formatRelativeTime(date: Date | string): string {
  // "3분 전", "1시간 전" 등
}

// ✅ 유효성 검사
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhoneNumber(phone: string): boolean {
  return /^01[0-9]-?\d{3,4}-?\d{4}$/.test(phone);
}
```

**사용 예시**:
```typescript
// apps/admin/src/features/products/components/ProductCard.tsx
import { formatPrice, formatDate } from '@auction/shared/utils';

// apps/user/src/components/ProductDetail.tsx
import { formatPrice, formatDate } from '@auction/shared/utils';
```

#### 3.2 앱 전용 lib에 배치할 것

**해당 앱에서만** 사용되는 유틸리티:

```typescript
// apps/admin/src/lib/adminUtils.ts

// 관리자 앱 전용 유틸리티
export function formatAdminLogEntry(log: AdminLog): string { }
export function checkAdminPermission(user: AdminUser, action: string): boolean { }
```

#### 3.3 모듈 전용 utils에 배치할 것

**해당 모듈에서만** 사용되는 유틸리티:

```typescript
// apps/admin/src/features/products/utils/productHelpers.ts

// 상품 모듈 전용 유틸리티
export function calculateDiscountRate(original: number, sale: number): number { }
export function generateProductSku(category: string, id: number): string { }
```

#### 3.4 배치 결정 플로차트

```
유틸리티 함수가 필요함
        │
        ▼
┌───────────────────────┐
│ 2개 이상 앱에서 사용? │
└───────────────────────┘
        │
   Yes  │  No
        ▼        ▼
  @auction/shared    ┌───────────────────────┐
                     │ 2개 이상 모듈에서 사용? │
                     └───────────────────────┘
                             │
                        Yes  │  No
                             ▼        ▼
                        src/lib     features/모듈/utils
```

### 4. 타입 정의 통합 규칙

#### 4.1 타입 배치 위치

| 타입 종류 | 배치 위치 | 예시 |
|----------|----------|------|
| API 응답/요청 타입 | `@auction/shared/types` | `Product`, `User`, `ApiResponse` |
| 앱 전역 상태 타입 | `apps/*/src/types` | `AdminAuthState`, `UserSession` |
| 모듈 전용 타입 | `features/*/types` | `ProductFormData`, `ProductFilter` |
| 컴포넌트 Props | 컴포넌트 파일 내부 | `interface ProductCardProps` |

#### 4.2 공유 타입 구조

```typescript
// packages/shared/src/types/index.ts

// ✅ API 엔티티 타입 (백엔드와 공유)
export interface Product {
  id: number;
  name: string;
  price: number;
  category_id: number;
  category_name?: string;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
}

export type ProductStatus = 'draft' | 'active' | 'sold' | 'closed';

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

export type UserRole = 'user' | 'admin' | 'super_admin';

// ✅ API 응답 래퍼
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ✅ 권한 관련 타입
export type AdminPermission =
  | 'products:read' | 'products:write' | 'products:delete'
  | 'users:read' | 'users:write' | 'users:delete'
  | 'payments:read' | 'payments:write';
```

#### 4.3 타입 중복 금지

```typescript
// ❌ 잘못된 예 - 타입 중복 정의
// apps/admin/src/lib/api.ts
interface Product { id: number; name: string; }

// apps/admin/src/features/products/types.ts
interface Product { id: number; name: string; } // 중복!

// ✅ 올바른 예 - 공유 타입 사용
// apps/admin/src/lib/api.ts
import type { Product } from '@auction/shared/types';

// apps/admin/src/features/products/types.ts
import type { Product } from '@auction/shared/types';

// 모듈 전용 타입만 추가 정의
export interface ProductFormData extends Partial<Product> {
  images: File[];
}
```

### 5. 컴포넌트 분류 규칙

#### 5.1 컴포넌트 배치 위치

| 분류 | 배치 위치 | 예시 |
|------|----------|------|
| 기본 UI 요소 | `@auction/ui` | `Button`, `Input`, `Card`, `Table` |
| 앱 공용 레이아웃 | `apps/*/src/components/layout` | `Header`, `Sidebar`, `Footer` |
| 앱 공용 컴포넌트 | `apps/*/src/components/` | `DataTable`, `SearchBar` |
| 모듈 전용 컴포넌트 | `features/*/components` | `ProductCard`, `UserAvatar` |

#### 5.2 컴포넌트 이동 기준

```typescript
// 컴포넌트가 3개 이상 모듈에서 사용되면 상위로 이동

// Step 1: 모듈 전용으로 시작
// features/products/components/PriceTag.tsx

// Step 2: 2개 모듈에서 사용 → 유지 (허용)
// features/products/components/PriceTag.tsx
// features/orders/components/OrderItem.tsx 에서 import

// Step 3: 3개+ 모듈에서 사용 → src/components로 이동
// src/components/PriceTag.tsx

// Step 4: 다른 앱에서도 필요 → @auction/ui로 이동
// packages/ui/src/components/PriceTag.tsx
```

### 6. API 클라이언트 규칙

#### 6.1 API 레이어 구조

```typescript
// packages/shared/src/api/client.ts
// ✅ 공용 API 클라이언트 (fetch 래퍼)
export function createApiClient(baseUrl: string, getToken?: () => string | null) {
  return {
    get: <T>(path: string, params?: object) => { },
    post: <T>(path: string, body: object) => { },
    put: <T>(path: string, body: object) => { },
    delete: <T>(path: string) => { },
  };
}

// apps/admin/src/lib/api.ts
// ✅ 앱별 API 클라이언트 인스턴스
import { createApiClient } from '@auction/shared/api';

export const api = createApiClient(
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  () => localStorage.getItem('admin_token')
);

// apps/admin/src/features/products/api/productsApi.ts
// ✅ 모듈별 API 함수
import { api } from '@/lib/api';
import type { Product } from '@auction/shared/types';

export const productsApi = {
  getList: (params?: ProductListParams) =>
    api.get<PaginatedResponse<Product>>('/products', params),
  getById: (id: number) =>
    api.get<Product>(`/products/${id}`),
  create: (data: ProductCreateData) =>
    api.post<Product>('/products', data),
};
```

### 7. 모듈화 체크리스트

새 기능 개발 또는 리팩토링 시 확인:

| 항목 | 확인 |
|------|------|
| 모듈이 디렉토리 단위로 독립적인가? | ☐ |
| 다른 기능 모듈을 직접 import하지 않는가? | ☐ |
| 공용 유틸리티가 올바른 위치에 있는가? | ☐ |
| 타입이 중복 정의되어 있지 않은가? | ☐ |
| 컴포넌트가 적절한 레벨에 배치되어 있는가? | ☐ |
| index.ts로 public API가 정의되어 있는가? | ☐ |

### 8. 마이그레이션 가이드

기존 코드를 모듈화 구조로 마이그레이션하는 단계:

```bash
# 1. features 디렉토리 생성
mkdir -p apps/admin/src/features/products/{components,hooks,api,types,utils}

# 2. 관련 파일 이동
mv apps/admin/src/components/products/* apps/admin/src/features/products/components/

# 3. index.ts 생성 (public API 정의)
# apps/admin/src/features/products/index.ts
export { ProductCard } from './components/ProductCard';
export { useProducts } from './hooks/useProducts';

# 4. import 경로 업데이트
# 기존: import { ProductCard } from '@/components/products/ProductCard';
# 변경: import { ProductCard } from '@/features/products';

# 5. 공용 유틸리티 추출
# 2개+ 모듈에서 사용하는 유틸리티 → @auction/shared/utils로 이동
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

> **중요**: 모든 코드 작성 시 보안을 최우선으로 고려해야 합니다. OWASP Top 10 취약점을 반드시 방어해야 하며, 보안 검토 없이 프로덕션 배포는 금지됩니다.

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

### 3. SQL Injection 방지 (A03:2021)

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

// ✅ ORM 사용 시 (Prisma)
const user = await prisma.user.findUnique({
  where: { id: userId }
});
```

### 4. XSS 방지 (A03:2021)

```typescript
// ✅ React는 기본적으로 escape
<div>{userInput}</div>

// ❌ dangerouslySetInnerHTML 사용 금지 (필요 시 sanitize)
<div dangerouslySetInnerHTML={{ __html: userInput }} /> // ❌

// ✅ Sanitize 후 사용
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

### 5. 인증 및 세션 관리 (A07:2021)

```typescript
// ✅ 안전한 쿠키 설정
cookies.set('session', token, {
  httpOnly: true,       // JavaScript 접근 차단 (XSS 방어)
  secure: true,         // HTTPS만 전송
  sameSite: 'strict',   // CSRF 방어
  maxAge: 60 * 60 * 24, // 만료 시간 설정
  path: '/',
});

// ❌ 안전하지 않은 쿠키
cookies.set('session', token); // ❌ 기본값은 취약함

// ✅ 비밀번호 해싱 (bcrypt)
import bcrypt from 'bcrypt';
const SALT_ROUNDS = 12;

// 저장 시
const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

// 검증 시
const isValid = await bcrypt.compare(inputPassword, hashedPassword);

// ❌ 평문 비밀번호 저장
const user = { password: plainPassword }; // ❌ 절대 금지
```

### 6. CSRF 방지 (A01:2021)

```typescript
// ✅ state 파라미터로 CSRF 방지
import crypto from 'crypto';

export function generateState(): string {
  return crypto.randomBytes(32).toString('hex');
}

// OAuth 시작 시 state 저장
cookies.set('oauth_state', state, {
  httpOnly: true,
  sameSite: 'lax',
  maxAge: 60 * 10,
});

// 콜백에서 state 검증
const savedState = cookies.get('oauth_state');
if (requestState !== savedState) {
  throw new InvalidStateError('CSRF attack detected');
}

// ✅ SameSite 쿠키로 추가 방어
cookies.set('session', token, {
  sameSite: 'strict', // 또는 'lax'
});
```

### 7. 입력 검증 (A03:2021)

```typescript
// ✅ 서버 측 입력 검증 필수 (클라이언트 검증은 UX용)
import { z } from 'zod';

const LoginSchema = z.object({
  username: z.string()
    .min(3, '아이디는 3자 이상')
    .max(20, '아이디는 20자 이하')
    .regex(/^[a-zA-Z0-9]+$/, '영문과 숫자만 가능'),
  password: z.string()
    .min(4, '비밀번호는 4자 이상'),
});

export async function POST(request: NextRequest) {
  const body = await request.json();

  // ✅ 스키마로 검증
  const result = LoginSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0].message },
      { status: 400 }
    );
  }

  const { username, password } = result.data;
  // ...
}

// ❌ 검증 없이 사용
const { username, password } = await request.json(); // ❌
```

### 8. 취약한 의존성 방지 (A06:2021)

```bash
# ✅ 정기적 취약점 검사 (최소 월 1회)
npm audit

# ✅ 취약점 자동 수정
npm audit fix

# ✅ 강제 수정 (breaking change 주의)
npm audit fix --force

# ✅ CI/CD에 audit 추가
# .github/workflows/security.yml
- name: Security audit
  run: npm audit --audit-level=high
```

### 9. 민감 데이터 노출 방지 (A02:2021)

```typescript
// ✅ 응답에서 민감 정보 제외
const { password, ...userWithoutPassword } = user;
return NextResponse.json({ user: userWithoutPassword });

// ✅ 선택적 필드 반환
const publicUser = {
  id: user.id,
  name: user.name,
  role: user.role,
  // password, email 등 민감 정보 제외
};

// ❌ 전체 객체 반환
return NextResponse.json({ user }); // ❌ 비밀번호 포함

// ✅ 에러 메시지에서 시스템 정보 숨기기
// 개발 환경
if (process.env.NODE_ENV === 'development') {
  return { error: error.message, stack: error.stack };
}
// 프로덕션
return { error: '서버 오류가 발생했습니다.' };
```

### 10. Rate Limiting (A04:2021)

```typescript
// ✅ API Rate Limiting 구현
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10초당 10회
});

export async function POST(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const { success, remaining } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
      { status: 429 }
    );
  }

  // 정상 처리...
}

// ✅ 로그인 시도 제한 (Brute Force 방지)
const loginRatelimit = new Ratelimit({
  limiter: Ratelimit.slidingWindow(5, '15 m'), // 15분당 5회 시도
});
```

### 11. 보안 헤더 설정 (A05:2021)

```typescript
// next.config.ts
const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline'",
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

### 12. 보안 체크리스트

모든 기능 개발 시 아래 항목을 확인하세요:

| 항목 | 확인 |
|------|------|
| 사용자 입력을 서버에서 검증하는가? | ☐ |
| SQL 쿼리에 파라미터를 바인딩하는가? | ☐ |
| 민감 정보가 로그에 남지 않는가? | ☐ |
| 비밀번호가 해싱되어 저장되는가? | ☐ |
| 세션 쿠키가 안전하게 설정되는가? | ☐ |
| CSRF 토큰을 검증하는가? | ☐ |
| Rate Limiting이 적용되는가? | ☐ |
| 에러 메시지에 시스템 정보가 노출되지 않는가? | ☐ |
| 응답에 민감 정보가 포함되지 않는가? | ☐ |
| 의존성 취약점이 없는가? (npm audit) | ☐ |

### 13. OWASP Top 10 (2021) 참고

| 순위 | 취약점 | 대응 방법 |
|------|--------|----------|
| A01 | Broken Access Control | 인가 검증, CSRF 방지 |
| A02 | Cryptographic Failures | HTTPS, 비밀번호 해싱 |
| A03 | Injection | 입력 검증, Parameterized Query |
| A04 | Insecure Design | Rate Limiting, 보안 설계 |
| A05 | Security Misconfiguration | 보안 헤더, 기본값 변경 |
| A06 | Vulnerable Components | npm audit, 정기 업데이트 |
| A07 | Auth Failures | 안전한 세션 관리 |
| A08 | Data Integrity Failures | 서명 검증, 입력 검증 |
| A09 | Logging Failures | 보안 로깅, 민감정보 마스킹 |
| A10 | SSRF | URL 검증, 화이트리스트 |

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
