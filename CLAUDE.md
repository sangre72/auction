# Claude Code 프로젝트 가이드

이 파일은 Claude Code가 프로젝트 작업 시 자동으로 참조하는 가이드입니다.

## 프로젝트 개요

- **프로젝트명**: Auction (옥션 프로젝트)
- **기술 스택**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **백엔드**: Python FastAPI (선택적)
- **주요 기능**: OAuth 소셜 로그인 (카카오, 네이버, 구글)

## 필수 참조 문서

작업 전 반드시 다음 문서들을 참조하세요:

| 문서 | 설명 | 참조 시점 |
|------|------|----------|
| `ARCHITECTURE.md` | 아키텍처 설계, SOLID 원칙, 디자인 패턴 | 새 기능 구현 시 |
| `CODING_GUIDELINES.md` | 코딩 규칙, 네이밍 컨벤션, 보안 규칙 | 모든 코드 작성 시 |
| `ERROR_HANDLING.md` | 에러 처리, 타임아웃, 재시도 로직 | 에러 처리 구현 시 |
| `PROJECT_STRUCTURE.md` | 디렉토리 구조, 파일 위치 규칙 | 새 파일 생성 시 |
| `CONTRIBUTING.md` | PR 절차, 코드 리뷰 체크리스트 | 커밋/PR 생성 시 |

## 핵심 코딩 규칙

### TypeScript
- `any` 사용 금지 - `unknown` 사용
- `strict: true` 모드 준수
- 명시적 타입 선언 필수

### 네이밍 컨벤션
- 변수/함수: `camelCase` (예: `accessToken`, `getUserInfo`)
- 상수: `UPPER_SNAKE_CASE` (예: `MAX_RETRIES`)
- 컴포넌트/클래스: `PascalCase` (예: `SocialLoginButtons`)
- Boolean: `is`, `has`, `should` 접두사 (예: `isLoading`)

### 파일명
- 컴포넌트: `PascalCase.tsx` (예: `SocialLoginButtons.tsx`)
- 유틸리티/클래스: `camelCase.ts` (예: `errors.ts`, `kakao.ts`)
- Next.js 페이지: 소문자 (예: `page.tsx`, `layout.tsx`)

### 에러 처리
- 커스텀 에러 클래스 사용 (`OAuthError`, `TokenRequestError` 등)
- `logError()` 함수로 구조화된 로깅
- 민감 정보 마스킹 필수

### 보안
- 환경 변수 검증 필수
- SQL Injection, XSS 방지
- CSRF 토큰 검증

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── api/auth/          # OAuth API 엔드포인트
│   └── auth/              # 인증 관련 페이지
├── components/            # React 컴포넌트
└── lib/auth/              # OAuth 핵심 로직 (재사용 가능)
    ├── index.ts           # 공통 인터페이스
    ├── errors.ts          # 에러 클래스
    ├── kakao.ts           # 카카오 OAuth
    ├── naver.ts           # 네이버 OAuth
    └── google.ts          # 구글 OAuth
```

## Git 커밋 규칙

Conventional Commits 형식 사용:

```
<type>(<scope>): <subject>

<body>
```

### Type
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 포맷팅
- `refactor`: 리팩토링
- `test`: 테스트 추가/수정
- `chore`: 빌드, 설정 변경

### 예시
```
feat(oauth): add Facebook OAuth provider
fix(auth): handle expired authorization code
docs(readme): update installation guide
```

## 사용 가능한 스킬

### /gitpush
변경사항을 자동 분석하여 Conventional Commits 형식으로 커밋하고 push합니다.

```bash
# 사용법
/gitpush
```

### /oauth-social-auth
카카오, 네이버, 구글 소셜 로그인 OAuth 코드를 자동 생성합니다.

## 작업 시 주의사항

1. **새 파일 생성 전**: `PROJECT_STRUCTURE.md` 확인하여 올바른 위치에 생성
2. **코드 작성 시**: `CODING_GUIDELINES.md` 규칙 준수
3. **에러 처리 시**: `ERROR_HANDLING.md`의 커스텀 에러 클래스 사용
4. **새 기능 구현 시**: `ARCHITECTURE.md`의 레이어 아키텍처 준수
5. **커밋 시**: Conventional Commits 형식 사용 또는 `/gitpush` 스킬 활용

## 환경 변수

필수 환경 변수 (`.env.local`):

```bash
# 카카오
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
KAKAO_REDIRECT_URI=

# 네이버
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
NAVER_REDIRECT_URI=

# 구글
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
```

## 자주 사용하는 명령어

```bash
# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 타입 체크
npx tsc --noEmit

# 린트
npm run lint
```
