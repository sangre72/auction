# Claude Code 프로젝트 가이드

## 프로젝트 개요

- **프로젝트명**: Auction (경매 플랫폼)
- **구조**: 모노레포 (pnpm workspace + Turborepo)
- **프론트엔드**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **백엔드**: Python FastAPI, PostgreSQL
- **앱**: admin(관리자), user(사용자)

## 빠른 시작

### 개발 서버 실행

```bash
# 프론트엔드
pnpm dev              # 전체 앱
pnpm dev:admin        # 관리자 앱 (localhost:3001)
pnpm dev:user         # 사용자 앱 (localhost:3000)

# 백엔드
cd backend && source venv/bin/activate
uvicorn main:app --reload --port 8000
```

### 빌드 및 검사

```bash
pnpm build            # 전체 빌드
pnpm lint             # ESLint 검사
pnpm type-check       # TypeScript 타입 검사
```

## 모노레포 구조

```
auction-001/
├── apps/
│   ├── admin/           # 관리자 앱 (포트 3001)
│   └── user/            # 사용자 앱 (포트 3000)
├── packages/
│   ├── shared/          # 공유 타입, 유틸리티, 인증
│   └── ui/              # 공유 UI 컴포넌트 (shadcn/ui)
└── backend/             # FastAPI 백엔드
```

## 새 모듈 생성 가이드

> **핵심 원칙**: 모든 모듈은 **디렉토리 단위로 독립적으로 이동/삭제 가능**해야 합니다.

### 프론트엔드 모듈 생성

새 기능 모듈 생성 시 `apps/*/src/features/` 아래에 다음 구조로 생성:

```
apps/admin/src/features/{module-name}/
├── components/          # 모듈 전용 컴포넌트
│   ├── {Module}Card.tsx
│   ├── {Module}Form.tsx
│   └── {Module}List.tsx
├── hooks/               # 모듈 전용 훅
│   └── use{Module}s.ts
├── api/                 # 모듈 전용 API 함수
│   └── {module}Api.ts
├── types/               # 모듈 전용 타입 (공유 타입은 @auction/shared)
│   └── {module}.types.ts
├── utils/               # 모듈 전용 유틸리티
│   └── {module}Helpers.ts
└── index.ts             # Public API (외부에 노출할 것만 export)
```

**index.ts 예시:**
```typescript
// features/{module-name}/index.ts
export { ModuleCard } from './components/ModuleCard';
export { ModuleForm } from './components/ModuleForm';
export { useModules } from './hooks/useModules';
export { moduleApi } from './api/moduleApi';
export type { ModuleFormData } from './types/module.types';
```

### 백엔드 모듈 생성

새 API 모듈 생성 시 `backend/` 아래에 다음 구조로 생성:

```
backend/{module_name}/
├── __init__.py          # 라우터 export
├── router.py            # API 엔드포인트 (/api/{module_name}/...)
├── schemas.py           # Pydantic 요청/응답 스키마
├── models.py            # SQLAlchemy 모델 (테이블 정의)
├── service.py           # 비즈니스 로직
└── crud.py              # 데이터베이스 CRUD 작업
```

**main.py에 라우터 등록:**
```python
from {module_name} import router as {module_name}_router
app.include_router({module_name}_router, prefix="/api/{module_name}", tags=["{Module}"])
```

### 공유 타입 추가

백엔드 스키마와 동기화되는 공유 타입은 `packages/shared/src/types/`에 추가:

```typescript
// packages/shared/src/types/{module}.ts
export interface {Module} {
  id: number;
  // 백엔드 스키마와 필드명 일치 (snake_case)
  created_at: string;
  updated_at: string;
}

// packages/shared/src/types/index.ts에 export 추가
export * from './{module}';
```

## 데이터베이스

- **DBMS**: PostgreSQL
- **ORM**: SQLAlchemy 2.0
- **스키마**: `backend/ddl/schema.sql`

### 새 테이블 추가

```bash
# 1. backend/{module_name}/models.py에 모델 정의
# 2. DDL 생성
pg_dump -h localhost -U postgres -d test_db --schema-only -t {table_name} > backend/ddl/tables/{table_name}.sql
# 3. schema.sql 갱신
pg_dump -h localhost -U postgres -d test_db --schema-only > backend/ddl/schema.sql
```

## 모듈화 규칙 (필수)

> **핵심**: 모든 모듈은 **디렉토리 단위로 독립적으로 이동/삭제 가능**해야 합니다.

### 프론트엔드 의존성 방향

```
@auction/shared ← @auction/ui ← src/lib ← features/* ← app/*
```

- **features/* 간 직접 import 금지**
- 공유 필요 시 → `@auction/shared` 또는 `src/lib`로 이동

### 백엔드 의존성 방향

```
core/ ← common/ ← {각 모듈}/ ← main.py
```

- **모듈 간 직접 import 금지** (순환 참조 방지)
- 공유 필요 시 → `common/` 또는 `core/`로 이동
- 각 모듈은 자체 router, schemas, models, crud, service 포함

### 배치 규칙

| 항목 | 2개+ 앱 사용 | 2개+ 모듈 사용 | 단일 모듈 |
|------|-------------|---------------|----------|
| 유틸리티 | `@auction/shared/utils` | `src/lib` | `features/*/utils` |
| 타입 | `@auction/shared/types` | `src/types` | `features/*/types` |
| 컴포넌트 | `@auction/ui` | `src/components` | `features/*/components` |

### 앱별 타입 디렉토리

```
apps/user/src/types/
├── index.ts      # export * from './auth'; export * from './queue';
├── auth.ts       # UserProfile, AuthState, UseAuthReturn
└── queue.ts      # QueueViewer, QueueListData

apps/admin/src/types/
├── index.ts
├── auth.ts       # AdminCredentials, AdminSession
└── slot.ts       # Slot (admin 전용 확장)
```

> hooks 파일 내 타입 정의 금지 → `types/` 디렉토리로 분리

## 스킬

| 스킬 | 설명 |
|------|------|
| `/gitpush` | 변경사항 분석 → Conventional Commit → push |
| `/gitpull` | dev 브랜치 merge → 현재 브랜치 pull |
| `/refactor` | 모듈화 가이드라인 준수 검사 및 수정 |
| `/modular-check` | 모듈화 상태 분석 (수정 없이 리포트만) |
| `/coding-guide` | 코딩 가이드라인 생성 및 CLAUDE.md 업데이트 |
| `/gitignore` | 프로젝트별 .gitignore 생성 |

### 증분 분석 원칙

> **IMPORTANT**: 소스가 추가/수정된 경우, 전체가 아닌 **변경된 부분만** 분석합니다.
> `/gitpush` 실행 전 반드시 `/refactor` 또는 `/modular-check` 실행

## 보안 라이브러리 규칙 (필수)

> **CRITICAL**: 보안 관련 기능은 반드시 **취약점이 없고 공격에 안전한** 검증된 라이브러리와 방식만 사용합니다.
>
> 코드 생성 시 OWASP Top 10 취약점(Injection, XSS, CSRF 등)을 반드시 방지해야 합니다.

### Python (FastAPI)

| 기능 | 필수 라이브러리 | 금지 |
|------|----------------|------|
| JWT | `python-jose[cryptography]` | `PyJWT` 단독 사용 |
| 비밀번호 해싱 | `passlib[bcrypt]`, `bcrypt` | 직접 구현, MD5, SHA1 |
| 암호화 | `cryptography` | 직접 구현 |
| HTTP 클라이언트 | `httpx` (async) | `urllib` 직접 사용 |

```python
# 올바른 import
from jose import jwt  # python-jose 사용
import bcrypt         # passlib과 함께 사용

# 금지
import jwt  # PyJWT 단독 - python-jose와 충돌
```

### TypeScript/JavaScript

| 기능 | 필수 라이브러리 | 금지 |
|------|----------------|------|
| JWT | `jose` | `jsonwebtoken` 단독 |
| 암호화 | `crypto` (Node.js 내장) | 직접 구현 |
| 인증 쿠키 | `httpOnly`, `secure`, `sameSite` 필수 | 일반 쿠키에 토큰 저장 |

### 인증 쿠키 필수 설정

**백엔드 (Python)**
```python
response.set_cookie(
    key="token",
    value=token,
    httponly=True,      # JavaScript 접근 차단
    secure=True,        # HTTPS 전용 (프로덕션)
    samesite="lax",     # CSRF 방지
)
```

**프론트엔드 (TypeScript)**
```typescript
// API 호출 시 반드시 credentials: 'include' 사용
const response = await fetch(`${API_URL}/endpoint`, {
  credentials: 'include',  // httpOnly 쿠키 자동 전송
});

// 금지: localStorage 사용
// localStorage.setItem('token', token);  // XSS 취약!
```

### 취약점 방지 필수 사항

| 취약점 | 방지 방법 |
|--------|----------|
| SQL Injection | ORM 사용, 파라미터 바인딩 필수 |
| XSS | 입력값 이스케이프, CSP 헤더 |
| CSRF | SameSite 쿠키, CSRF 토큰 |
| 인증 우회 | JWT 검증, 세션 관리 |
| 민감정보 노출 | 환경변수, 로그 마스킹 |

### 금지 사항

- 비밀번호 평문 저장/로깅
- 토큰을 localStorage에 저장 (XSS 취약)
- 직접 암호화 알고리즘 구현 (취약점 위험)
- 환경변수 없이 시크릿 키 하드코딩
- SQL 문자열 직접 조합 (Injection 취약)
- 사용자 입력값 검증 없이 사용

### JWT 인증 필수

> **중요**: 공개 API를 제외한 모든 API는 JWT access token 검증이 필수입니다.

| 구분 | 인증 필요 | 예시 |
|------|----------|------|
| 공개 API | ❌ | 로그인, 회원가입, 공개 상품 조회 |
| 일반 API | ✅ | 상품 CRUD, 사용자 정보, 주문 |
| 관리자 API | ✅ + 권한 | 사용자 관리, 시스템 설정 |

```python
# 백엔드 - 인증 필수 API (기본)
@router.get("/products")
async def list_products(
    current_user: User = Depends(get_current_user),  # 필수
    db: Session = Depends(get_db)
):
    pass

# 공개 API는 예외적으로 명시
@router.post("/auth/login")  # 공개
@router.get("/products/public/{id}")  # 공개 (명시적 prefix)
```

```typescript
// 프론트엔드 - API 호출 시 항상 토큰 포함
const response = await fetch('/api/products', {
  headers: { 'Authorization': `Bearer ${accessToken}` },
  credentials: 'include',
});
```

### 프로덕션 에러 응답 규칙

> **중요**: 프로덕션에서는 HTTP 상태 코드(404, 500 등)를 사용자에게 직접 노출하지 않습니다.

| 항목 | 개발 환경 | 프로덕션 환경 |
|------|----------|-------------|
| HTTP 상태 코드 | 실제 코드 (404, 500) | 항상 200 |
| 에러 메시지 | 상세 메시지 | 일반 메시지 |
| 스택 트레이스 | 포함 | ❌ 절대 금지 |
| 성공/실패 판단 | `success` 필드 | `success` 필드 |

```python
# 백엔드 - 프로덕션 에러 응답
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=200,  # 항상 200 반환
        content={
            "success": False,
            "message": "요청을 처리할 수 없습니다.",
            "error_code": "INTERNAL_ERROR"
        }
    )
```

```typescript
// 프론트엔드 - success 필드로 성공/실패 판단
const data = await response.json();
if (!data.success) {
  throw new ApiError(data.message, data.error_code);
}

// ❌ 잘못된 예 - HTTP 상태 코드로 판단
if (response.status === 404) { }  // 프로덕션에서는 항상 200
```

**에러 코드 매핑**:
| 내부 상태 | error_code | 사용자 메시지 |
|----------|------------|--------------|
| 401 | `AUTH_REQUIRED` | 로그인이 필요합니다 |
| 403 | `ACCESS_DENIED` | 접근 권한이 없습니다 |
| 404 | `NOT_FOUND` | 요청한 정보를 찾을 수 없습니다 |
| 500 | `INTERNAL_ERROR` | 요청을 처리할 수 없습니다 |

## 작업 규칙

1. **파일 생성/수정 후** → `/refactor` 실행 (필수)
2. **커밋 시** → `/gitpush` 사용
3. **타입 정의** → `@auction/shared/types`에서 import (중복 금지)
4. **any 사용 금지** → `unknown` 사용
5. **보안 라이브러리** → 위 규칙 준수 (필수)

> 상세 규칙은 `CODING_GUIDELINES.md` 참조
