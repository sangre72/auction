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

## 작업 규칙

1. **파일 생성/수정 후** → `/refactor` 실행 (필수)
2. **커밋 시** → `/gitpush` 사용
3. **타입 정의** → `@auction/shared/types`에서 import (중복 금지)
4. **any 사용 금지** → `unknown` 사용

> 상세 규칙은 `CODING_GUIDELINES.md` 참조
