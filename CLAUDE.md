# Claude Code 프로젝트 가이드

## 프로젝트 개요

- **프로젝트명**: Auction (경매 플랫폼)
- **구조**: 모노레포 (pnpm workspace + Turborepo)
- **프론트엔드**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **백엔드**: Python FastAPI, PostgreSQL
- **앱**: admin(관리자), user(사용자)

## 모노레포 구조

```
auction-001/
├── apps/
│   ├── admin/           # 관리자 앱
│   └── user/            # 사용자 앱
├── packages/
│   ├── shared/          # 공유 타입, 유틸리티
│   └── ui/              # 공유 UI 컴포넌트
└── backend/             # FastAPI 백엔드
```

## 모듈화 규칙 (필수)

> **핵심**: 프론트엔드 모듈은 **디렉토리 단위로 독립적으로 이동 가능**해야 합니다.

### 기능 모듈 구조

```
apps/*/src/
├── features/            # 기능별 모듈 (자체 포함)
│   └── products/
│       ├── components/
│       ├── hooks/
│       ├── api/
│       ├── types/
│       ├── utils/
│       └── index.ts     # public API
├── components/          # 앱 공용 컴포넌트
├── lib/                 # 앱 공용 유틸리티
└── app/                 # Next.js 페이지
```

### 의존성 방향

```
@auction/shared ← @auction/ui ← src/lib ← features/* ← app/*
```

- **features/* 간 직접 import 금지**
- 공유 필요 시 → `@auction/shared` 또는 `src/lib`로 이동

### 배치 규칙

| 항목 | 2개+ 앱 사용 | 2개+ 모듈 사용 | 단일 모듈 |
|------|-------------|---------------|----------|
| 유틸리티 | `@auction/shared/utils` | `src/lib` | `features/*/utils` |
| 타입 | `@auction/shared/types` | `src/types` | `features/*/types` |
| 컴포넌트 | `@auction/ui` | `src/components` | `features/*/components` |

## 스킬

| 스킬 | 설명 |
|------|------|
| `/gitpush` | 변경사항 분석 → Conventional Commit → push |
| `/gitpull` | dev 브랜치 merge → 현재 브랜치 pull |
| `/refactor` | 모듈화 가이드라인 준수 검사 |

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

```python
response.set_cookie(
    key="token",
    value=token,
    httponly=True,      # JavaScript 접근 차단
    secure=True,        # HTTPS 전용 (프로덕션)
    samesite="lax",     # CSRF 방지
)
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

## 작업 규칙

1. **파일 생성/수정 후** → `/refactor` 실행 (필수)
2. **커밋 시** → `/gitpush` 사용
3. **타입 정의** → `@auction/shared/types`에서 import (중복 금지)
4. **any 사용 금지** → `unknown` 사용
5. **보안 라이브러리** → 위 규칙 준수 (필수)

> 상세 규칙은 `CODING_GUIDELINES.md` 참조
