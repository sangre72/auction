# Auction - 경매 플랫폼

슬롯 기반 경매 및 멀티 게시판을 지원하는 풀스택 경매 플랫폼입니다.

## 주요 기능

### 경매 시스템
- **슬롯 기반 경매** - 상품별 다중 슬롯 구매 지원
- **실시간 대기열** - WebSocket 기반 대기열 시스템
- **결제 연동** - PortOne(포트원) V2 결제 통합

### 사용자 시스템
- **소셜 로그인** - 카카오, 네이버, 구글 OAuth 2.0
- **이메일 로그인** - 일반 회원가입/로그인
- **httpOnly 쿠키 인증** - 보안 강화된 토큰 관리
- **마이페이지** - 주문 내역, 관심 상품, 포인트 관리

### 게시판 시스템
- **멀티 게시판** - 공지사항, 자유게시판 등 다중 게시판
- **댓글/대댓글** - 계층형 댓글 시스템
- **좋아요** - 게시글 좋아요 기능
- **이미지/첨부파일** - 게시글 미디어 업로드
- **금칙어 필터링** - 자동 금칙어 감지 및 필터링

### 관리자 시스템
- **상품 관리** - 상품 등록, 수정, 슬롯 관리
- **사용자 관리** - 회원 조회, 정지, 포인트 지급
- **게시판 관리** - 게시판 생성, 게시글/댓글 관리
- **금칙어 관리** - 금칙어 등록 및 관리
- **통계 대시보드** - 방문자, 매출, 회원 통계

## 기술 스택

| 영역 | 기술 |
|------|------|
| **Frontend** | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| **Backend** | Python FastAPI, SQLAlchemy |
| **Database** | PostgreSQL |
| **인증** | JWT (httpOnly Cookie), OAuth 2.0 |
| **결제** | PortOne V2 |
| **모노레포** | pnpm workspace, Turborepo |

## 프로젝트 구조

```
auction-001/
├── apps/
│   ├── admin/              # 관리자 앱 (Next.js)
│   │   └── src/
│   │       ├── app/        # 페이지
│   │       ├── components/ # 컴포넌트
│   │       ├── features/   # 기능 모듈
│   │       └── lib/        # API, 유틸리티
│   └── user/               # 사용자 앱 (Next.js)
│       └── src/
│           ├── app/        # 페이지
│           ├── components/ # 컴포넌트
│           ├── hooks/      # 커스텀 훅
│           └── lib/        # API, 유틸리티
├── packages/
│   ├── shared/             # 공유 타입, 유틸리티
│   └── ui/                 # 공유 UI 컴포넌트
├── backend/                # FastAPI 백엔드
│   ├── auth/               # 관리자 인증
│   ├── users/              # 사용자 관리
│   ├── products/           # 상품 관리
│   ├── payments/           # 결제
│   ├── points/             # 포인트
│   ├── boards/             # 게시판
│   ├── forbidden_words/    # 금칙어
│   ├── banners/            # 배너
│   ├── categories/         # 카테고리
│   ├── visitors/           # 방문자 통계
│   ├── wishlist/           # 관심 상품
│   ├── core/               # 설정, DB, 보안
│   ├── common/             # 공통 유틸리티
│   └── ddl/                # 데이터베이스 DDL
│       ├── schema.sql      # 전체 스키마
│       ├── tables/         # 테이블별 DDL
│       └── create_tables.sh
└── docs/                   # 문서
```

## 데이터베이스 스키마

### 테이블 목록 (22개)

| 도메인 | 테이블 | 설명 |
|--------|--------|------|
| **사용자** | `users` | 사용자 정보 |
| | `user_devices` | 디바이스 핑거프린트 |
| | `shipping_addresses` | 배송지 (암호화) |
| | `suspicious_activities` | 의심 활동 로그 |
| **관리자** | `admins` | 관리자 계정 |
| **상품** | `categories` | 카테고리 |
| | `products` | 상품 |
| | `product_images` | 상품 이미지 |
| | `product_slots` | 상품 슬롯 |
| **결제/포인트** | `payments` | 결제 내역 |
| | `point_histories` | 포인트 이력 |
| **게시판** | `boards` | 게시판 |
| | `posts` | 게시글 |
| | `post_images` | 게시글 이미지 |
| | `post_attachments` | 첨부파일 |
| | `post_likes` | 좋아요 |
| | `comments` | 댓글 |
| | `forbidden_words` | 금칙어 |
| **기타** | `banners` | 배너 |
| | `visitors` | 방문자 로그 |
| | `daily_stats` | 일별 통계 |
| | `wishlists` | 관심 상품 |

### DDL 파일

```bash
# 전체 스키마 적용
psql -h localhost -U postgres -d your_db -f backend/ddl/schema.sql

# 테이블 생성 스크립트
cd backend/ddl && ./create_tables.sh
```

## 빠른 시작

### 1. 의존성 설치

```bash
# Frontend (모노레포 루트에서)
pnpm install

# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. 환경 변수 설정

```bash
# Backend (.env)
cp backend/.env.example backend/.env
# 데이터베이스, OAuth 키 등 설정

# Admin App
cp apps/admin/.env.example apps/admin/.env.local

# User App
cp apps/user/.env.example apps/user/.env.local
```

### 3. 데이터베이스 초기화

```bash
cd backend
python scripts/init_db.py   # 테이블 생성
python scripts/seed.py      # 초기 데이터
```

### 4. 개발 서버 실행

```bash
# Backend (터미널 1)
cd backend
uvicorn main:app --reload --port 8000

# Frontend (터미널 2, 루트에서)
pnpm dev
```

- 사용자 앱: http://localhost:3000
- 관리자 앱: http://localhost:3001
- API 문서: http://localhost:8000/docs

## API 엔드포인트

### 인증

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/user/auth/register` | 회원가입 |
| POST | `/api/user/auth/login` | 로그인 |
| POST | `/api/user/auth/logout` | 로그아웃 |
| GET | `/api/user/auth/me` | 내 정보 조회 |
| GET | `/api/oauth/{provider}` | 소셜 로그인 |

### 게시판

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/public/boards` | 게시판 목록 |
| GET | `/api/public/boards/{slug}/posts` | 게시글 목록 |
| GET | `/api/public/boards/{slug}/posts/{id}` | 게시글 상세 |
| POST | `/api/boards/{slug}/posts` | 게시글 작성 |
| POST | `/api/boards/{slug}/posts/{id}/comments` | 댓글 작성 |
| POST | `/api/boards/{slug}/posts/{id}/like` | 좋아요 토글 |

### 상품

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/products` | 상품 목록 |
| GET | `/api/products/{id}` | 상품 상세 |
| GET | `/api/products/{id}/slots` | 슬롯 목록 |
| POST | `/api/products/{id}/slots/purchase` | 슬롯 구매 |

## 보안

- **httpOnly 쿠키**: JWT 토큰은 httpOnly 쿠키로 관리
- **비밀번호 해싱**: bcrypt 사용
- **CSRF 방지**: SameSite 쿠키 설정
- **개인정보 암호화**: 배송지 정보 AES 암호화
- **본인인증**: CI 해시 기반 중복 가입 방지

## 개발 가이드

- **[CLAUDE.md](CLAUDE.md)** - Claude Code 프로젝트 가이드
- **[CODING_GUIDELINES.md](CODING_GUIDELINES.md)** - 코딩 규칙
- **[backend/ddl/README.md](backend/ddl/README.md)** - DDL 사용법

## 라이선스

MIT
