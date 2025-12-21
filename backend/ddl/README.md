# DDL (Data Definition Language)

이 디렉토리에는 Auction 프로젝트의 데이터베이스 스키마가 포함되어 있습니다.

## 파일 구조

```
ddl/
├── README.md           # 이 파일
├── schema.sql          # 전체 스키마 (모든 테이블, 인덱스, FK)
├── create_tables.sh    # 테이블 생성 스크립트
└── tables/             # 테이블별 개별 DDL
    ├── users.sql
    ├── admins.sql
    ├── products.sql
    └── ...
```

## 테이블 목록 (22개)

| 테이블명 | 설명 |
|---------|------|
| `users` | 사용자 |
| `user_devices` | 사용자 디바이스 (핑거프린트) |
| `shipping_addresses` | 배송지 (암호화) |
| `suspicious_activities` | 의심 활동 로그 |
| `admins` | 관리자 |
| `categories` | 카테고리 |
| `products` | 상품 |
| `product_images` | 상품 이미지 |
| `product_slots` | 상품 슬롯 |
| `payments` | 결제 |
| `point_histories` | 포인트 이력 |
| `banners` | 배너 |
| `visitors` | 방문자 로그 |
| `daily_stats` | 일별 통계 |
| `wishlists` | 관심 상품 |
| `boards` | 게시판 |
| `posts` | 게시글 |
| `post_images` | 게시글 이미지 |
| `post_attachments` | 게시글 첨부파일 |
| `post_likes` | 게시글 좋아요 |
| `comments` | 댓글 |
| `forbidden_words` | 금칙어 |

## 사용법

### 전체 스키마 적용

```bash
# PostgreSQL에 전체 스키마 적용
psql -h localhost -U postgres -d your_database -f schema.sql
```

### 개별 테이블 생성

```bash
# 특정 테이블만 생성
psql -h localhost -U postgres -d your_database -f tables/users.sql
```

### 스크립트 사용

```bash
# 생성 스크립트 실행
./create_tables.sh
```

## DDL 갱신

데이터베이스 스키마가 변경되면 다음 명령으로 DDL을 갱신하세요:

```bash
# 전체 스키마 내보내기
pg_dump -h localhost -U postgres -d test_db --schema-only --no-owner --no-privileges > schema.sql

# 개별 테이블 내보내기
pg_dump -h localhost -U postgres -d test_db --schema-only --no-owner --no-privileges -t users > tables/users.sql
```

## 주의사항

- DDL 파일은 **구조만** 포함하고 데이터는 포함하지 않습니다
- 외래 키 의존성으로 인해 테이블 생성 순서가 중요합니다
- `schema.sql`은 올바른 순서로 정렬되어 있습니다
