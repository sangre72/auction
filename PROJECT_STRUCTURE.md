# 프로젝트 구조 가이드

이 문서는 프로젝트의 전체 구조와 각 디렉토리/파일의 역할을 설명합니다.

## 디렉토리 구조 개요

```
auction-001/
├── .claude/              # Claude Code 확장 도구
├── docs/                 # 프로젝트 문서
├── src/                  # 소스 코드
├── backend/              # Python 백엔드 (선택)
└── [root files]          # 설정 및 문서
```

## 상세 설명

### `.claude/` - Claude Code 도구

Claude Code를 활용하여 개발 생산성을 높이는 도구들입니다.

```
.claude/
├── skills/               # Claude Code 스킬
│   └── oauth-social-auth/
│       ├── SKILL.md                    # 스킬 정의 및 사용법
│       ├── EXAMPLES.md                 # 코드 예제
│       ├── CONFIG.md                   # 설정 가이드
│       └── N8N_WORKFLOW.json           # N8N 워크플로우 템플릿
├── templates/            # 코드 생성 템플릿
│   └── oauth-provider.template.ts      # OAuth 제공자 템플릿
└── scripts/              # 자동화 스크립트
    └── new-oauth-provider.sh           # 새 제공자 스캐폴딩
```

**사용 예시**:
```bash
# 새 OAuth 제공자 추가
./.claude/scripts/new-oauth-provider.sh facebook

# Claude에게 요청
"카카오 로그인 추가해줘"
```

### `docs/` - 프로젝트 문서

Architecture Decision Records 및 기술 문서를 관리합니다.

```
docs/
└── adr/                  # Architecture Decision Records
    ├── README.md                       # ADR 소개
    ├── template.md                     # ADR 템플릿
    ├── 0001-typescript-and-nextjs.md   # TypeScript/Next.js 선택 이유
    └── 0002-oauth-provider-interface.md # OAuth 인터페이스 설계
```

**역할**:
- 주요 아키텍처 결정 기록
- 결정의 컨텍스트와 근거 문서화
- 미래의 개발자를 위한 지식 전달

### `src/` - 소스 코드

Next.js 애플리케이션의 핵심 코드입니다.

```
src/
├── app/                  # Next.js App Router
│   ├── api/             # API 엔드포인트
│   │   └── auth/
│   │       ├── [provider]/
│   │       │   └── route.ts           # OAuth 시작 (동적 라우트)
│   │       └── callback/
│   │           └── route.ts           # OAuth 콜백 처리
│   ├── auth/            # 인증 관련 페이지
│   │   ├── success/
│   │   │   └── page.tsx              # 로그인 성공 페이지
│   │   └── error/
│   │       └── page.tsx              # 로그인 에러 페이지
│   ├── page.tsx         # 홈 페이지
│   ├── layout.tsx       # 루트 레이아웃
│   └── globals.css      # 글로벌 스타일
├── components/          # React 컴포넌트
│   └── SocialLoginButtons.tsx         # 소셜 로그인 버튼
└── lib/                 # 비즈니스 로직 및 유틸리티
    └── auth/           # OAuth 핵심 로직 (재사용 가능)
        ├── index.ts                   # 공통 인터페이스 정의
        ├── errors.ts                  # 에러 클래스 및 유틸리티
        ├── kakao.ts                   # 카카오 OAuth 구현
        ├── naver.ts                   # 네이버 OAuth 구현
        └── google.ts                  # 구글 OAuth 구현
```

#### src/lib/auth/ (핵심 라이브러리)

이 디렉토리는 **재사용 가능한 OAuth 라이브러리**입니다. Next.js뿐만 아니라 다른 프레임워크에서도 사용할 수 있습니다.

**index.ts** - 공통 인터페이스
```typescript
export interface OAuthProvider {
  getAuthorizationUrl(state: string): string;
  getAccessToken(code: string): Promise<TokenResponse>;
  getUserInfo(accessToken: string): Promise<UserInfo>;
}
```

**errors.ts** - 에러 처리
```typescript
export class OAuthError extends Error { }
export class TokenRequestError extends OAuthError { }
export function logError(error: Error) { }
export function fetchWithRetry() { }
```

**{provider}.ts** - 제공자별 구현
```typescript
export class KakaoOAuthProvider implements OAuthProvider {
  // 카카오 OAuth 2.0 구현
}
```

### `backend/` - Python 백엔드 (선택)

AI 기능 통합을 위한 Python FastAPI 백엔드입니다.

```
backend/
├── app/
│   ├── main.py          # FastAPI 애플리케이션
│   ├── routers/         # API 라우터
│   │   └── auth.py                    # OAuth 라우터
│   ├── services/        # 비즈니스 로직
│   │   └── oauth.py                   # OAuth 서비스
│   └── models/          # 데이터 모델
│       └── user.py                    # 사용자 모델
└── requirements.txt     # Python 의존성
```

**사용 시나리오**:
- AI 기능 통합 (OpenAI, Anthropic)
- 복잡한 데이터 처리
- Python 라이브러리 활용

### Root Files - 설정 및 문서

```
[루트 디렉토리]
├── ARCHITECTURE.md      # 아키텍처 설계 문서 ⭐
├── CODING_GUIDELINES.md # 코딩 규칙 ⭐
├── ERROR_HANDLING.md    # 에러 처리 가이드 ⭐
├── CONTRIBUTING.md      # 기여 가이드 ⭐
├── QUICKSTART.md        # 빠른 시작 가이드
├── README.md            # 프로젝트 소개
├── package.json         # Node.js 의존성
├── tsconfig.json        # TypeScript 설정
├── next.config.ts       # Next.js 설정
├── tailwind.config.ts   # Tailwind CSS 설정
├── .env.local           # 환경 변수
└── .gitignore           # Git 무시 파일
```

## 레이어 아키텍처

### 1. Presentation Layer (프레젠테이션 계층)

**위치**: `src/app/`, `src/components/`

**책임**:
- 사용자 인터페이스
- 사용자 입력 처리
- 라우팅

**파일**:
- `src/app/page.tsx` - 홈 페이지
- `src/app/auth/success/page.tsx` - 성공 페이지
- `src/app/auth/error/page.tsx` - 에러 페이지
- `src/components/SocialLoginButtons.tsx` - 로그인 버튼

### 2. API Layer (API 계층)

**위치**: `src/app/api/`

**책임**:
- HTTP 요청/응답 처리
- 요청 검증
- 라우팅 로직

**파일**:
- `src/app/api/auth/[provider]/route.ts` - OAuth 시작
- `src/app/api/auth/callback/route.ts` - OAuth 콜백

### 3. Service Layer (서비스 계층)

**위치**: `src/lib/auth/`

**책임**:
- 비즈니스 로직
- OAuth 플로우 구현
- 외부 API 통신

**파일**:
- `src/lib/auth/kakao.ts` - 카카오 OAuth
- `src/lib/auth/naver.ts` - 네이버 OAuth
- `src/lib/auth/google.ts` - 구글 OAuth

### 4. Infrastructure Layer (인프라 계층)

**위치**: `src/lib/auth/errors.ts`

**책임**:
- 에러 처리
- 로깅
- 유틸리티 함수

## 파일 네이밍 규칙

| 타입 | 규칙 | 예시 |
|------|------|------|
| React 컴포넌트 | PascalCase | `SocialLoginButtons.tsx` |
| 클래스 파일 | camelCase | `kakao.ts` |
| 유틸리티 | camelCase | `errors.ts` |
| Next.js 페이지 | 소문자 | `page.tsx`, `layout.tsx` |
| Next.js 라우트 | kebab-case | `[provider]`, `callback` |
| 설정 파일 | kebab-case | `next.config.ts` |

## 모듈 경계

### 재사용 가능한 모듈

다음 모듈은 **다른 프로젝트에서도 사용 가능**합니다:

- `src/lib/auth/` - OAuth 라이브러리 전체
  - `index.ts`
  - `errors.ts`
  - `kakao.ts`
  - `naver.ts`
  - `google.ts`

**사용 예시**:
```typescript
// 다른 프로젝트에서 import
import { KakaoOAuthProvider } from './lib/auth/kakao';

const provider = new KakaoOAuthProvider();
const authUrl = provider.getAuthorizationUrl('state');
```

### Next.js 의존적인 모듈

다음 모듈은 **Next.js에 의존**합니다:

- `src/app/` - Next.js App Router 사용
- `src/components/` - Next.js/React 컴포넌트

## 확장 포인트

### 1. 새 OAuth 제공자 추가

**템플릿**: `.claude/templates/oauth-provider.template.ts`

**스크립트**: `.claude/scripts/new-oauth-provider.sh`

**수정 파일**:
1. `src/lib/auth/{provider}.ts` - 생성
2. `src/app/api/auth/[provider]/route.ts` - 수정
3. `src/app/api/auth/callback/route.ts` - 수정
4. `src/components/SocialLoginButtons.tsx` - 수정

### 2. 새 기능 추가

**예시**: 토큰 갱신 기능

**수정 파일**:
1. `src/lib/auth/index.ts` - 인터페이스 확장
2. `src/lib/auth/{provider}.ts` - 메서드 구현
3. `src/app/api/auth/refresh/route.ts` - 새 라우트 생성

### 3. 에러 타입 추가

**수정 파일**:
1. `src/lib/auth/errors.ts` - 새 에러 클래스 추가
2. `src/lib/auth/{provider}.ts` - 에러 사용
3. `src/app/auth/error/page.tsx` - UI 메시지 추가

## 의존성 관계

```
src/app/api/auth/
    ↓ depends on
src/lib/auth/
    ↓ depends on
src/lib/auth/errors.ts
```

**원칙**: 상위 레이어는 하위 레이어에 의존하지만, 하위 레이어는 상위 레이어를 알지 못함

## 테스트 구조

```
src/lib/auth/
├── __tests__/           # 테스트 파일
│   ├── kakao.test.ts
│   ├── naver.test.ts
│   ├── google.test.ts
│   └── errors.test.ts
├── kakao.ts
├── naver.ts
├── google.ts
└── errors.ts
```

## 환경별 구성

### 개발 (Development)

```
.env.local              # 로컬 환경 변수
npm run dev             # 개발 서버
```

### 프로덕션 (Production)

```
환경 변수는 배포 플랫폼에서 관리
npm run build           # 빌드
npm run start           # 프로덕션 서버
```

## 모범 사례

### 1. Import 경로

```typescript
// ✅ 절대 경로 사용 (@/ alias)
import { KakaoOAuthProvider } from '@/lib/auth/kakao';

// ❌ 상대 경로 (깊은 중첩 시)
import { KakaoOAuthProvider } from '../../lib/auth/kakao';
```

### 2. 파일 위치

```typescript
// ✅ 올바른 위치
src/lib/auth/kakao.ts              # OAuth 로직
src/app/api/auth/callback/route.ts # API 라우트
src/components/LoginButton.tsx     # UI 컴포넌트

// ❌ 잘못된 위치
src/app/kakao-oauth.ts             # OAuth 로직이 app 폴더에
src/lib/auth/LoginButton.tsx       # UI가 lib 폴더에
```

### 3. 파일 크기

- **200줄 이하** 권장
- **300줄 이상** 분리 고려
- **500줄 이상** 반드시 분리

## 관련 문서

- [ARCHITECTURE.md](ARCHITECTURE.md) - 전체 아키텍처 설명
- [CODING_GUIDELINES.md](CODING_GUIDELINES.md) - 코딩 규칙
- [CONTRIBUTING.md](CONTRIBUTING.md) - 기여 가이드
