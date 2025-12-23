# Backend API

FastAPI 기반 경매 플랫폼 백엔드 API 서버

## 빠른 시작

```bash
# 가상환경 활성화
source venv/bin/activate

# 의존성 설치
pip install -r requirements.txt

# 서버 실행
uvicorn main:app --reload --port 8000
```

## JWT 인증 시스템

### 토큰 설정

| 토큰 | 만료 시간 | 저장 위치 |
|------|----------|----------|
| Access Token | 30분 | httpOnly 쿠키 |
| Refresh Token | 7일 | httpOnly 쿠키 |

### 환경변수

```bash
# .env 파일
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# 시크릿 키 (반드시 변경!)
SECRET_KEY=your-secret-key-change-in-production-min-32-chars
JWT_SECRET_KEY=your-jwt-secret-key-change-in-production-min-32-chars
```

## 토큰 블랙리스트 설정

로그아웃 시 토큰을 무효화하기 위한 블랙리스트 기능입니다.

### DB 기반 (기본)

```bash
TOKEN_BLACKLIST_BACKEND=db
```

- PostgreSQL 테이블 사용
- 만료된 토큰 자동 정리
- 추가 설정 불필요

**테이블 생성:**
```bash
psql -h localhost -U postgres -d your_db -f ddl/tables/token_blacklist.sql
```

### Redis 기반 (고성능)

```bash
TOKEN_BLACKLIST_BACKEND=redis
REDIS_URL=redis://localhost:6379/0
```

- Redis 설치 필요
- TTL로 자동 만료
- 대규모 트래픽에 권장

**Redis 설치 (macOS):**
```bash
brew install redis
brew services start redis
```

**Redis 설치 (Ubuntu):**
```bash
sudo apt install redis-server
sudo systemctl start redis
```

## 인증 API 엔드포인트

### 관리자 인증

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| POST | `/api/auth/login` | 로그인 (토큰 발급) |
| POST | `/api/auth/refresh` | 토큰 갱신 |
| POST | `/api/auth/logout` | 로그아웃 (토큰 무효화) |
| GET | `/api/auth/me` | 현재 사용자 정보 |

### 일반 사용자 인증

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| POST | `/api/user/auth/register` | 회원가입 |
| POST | `/api/user/auth/login` | 로그인 |
| POST | `/api/user/auth/refresh` | 토큰 갱신 |
| POST | `/api/user/auth/logout` | 로그아웃 |
| GET | `/api/user/auth/me` | 현재 사용자 정보 |

## 보안 설정

### 쿠키 설정

```python
response.set_cookie(
    key="admin_session",
    value=access_token,
    httponly=True,      # JavaScript 접근 차단 (XSS 방지)
    secure=True,        # HTTPS 전용 (프로덕션)
    samesite="lax",     # CSRF 방지
    max_age=1800,       # 30분
)
```

### 사용 라이브러리

- `python-jose[cryptography]` - JWT 토큰 생성/검증
- `bcrypt` - 비밀번호 해싱
- `redis` - 블랙리스트 (선택)
