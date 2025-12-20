# OAuth 소셜 로그인 모듈

카카오, 네이버, 구글 소셜 로그인을 지원하는 완전한 OAuth 2.0 구현입니다.

## 주요 기능

- ✅ **카카오 로그인** - Kakao OAuth 2.0 완전 지원
- ✅ **네이버 로그인** - Naver OAuth 2.0 완전 지원
- ✅ **구글 로그인** - Google OAuth 2.0 완전 지원
- ✅ **Next.js + TypeScript** - 프론트엔드 및 API Routes
- ✅ **Python FastAPI** - AI 지원을 위한 백엔드
- ✅ **N8N 통합** - 워크플로우 자동화 지원
- ✅ **Claude Code 스킬** - 코드 자동 생성 지원
- ✅ **견고한 에러 처리** - 타임아웃, 재시도, 사용자 친화적 에러 메시지

## 프로젝트 구조

```
auction-001/
├── .claude/                        # Claude Code 설정 및 도구
│   ├── skills/
│   │   └── oauth-social-auth/      # OAuth 코드 생성 스킬
│   │       ├── SKILL.md
│   │       ├── EXAMPLES.md
│   │       ├── CONFIG.md
│   │       └── N8N_WORKFLOW.json
│   ├── templates/                  # 코드 템플릿
│   │   └── oauth-provider.template.ts
│   └── scripts/                    # 스캐폴딩 스크립트
│       └── new-oauth-provider.sh
├── docs/                           # 프로젝트 문서
│   └── adr/                        # Architecture Decision Records
│       ├── README.md
│       ├── template.md
│       ├── 0001-typescript-and-nextjs.md
│       └── 0002-oauth-provider-interface.md
├── src/                            # Next.js 프론트엔드
│   ├── app/
│   │   ├── api/auth/              # OAuth API Routes
│   │   │   ├── [provider]/route.ts
│   │   │   └── callback/route.ts
│   │   ├── auth/                  # 인증 페이지
│   │   │   ├── success/page.tsx
│   │   │   └── error/page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   └── SocialLoginButtons.tsx
│   └── lib/auth/                  # OAuth 라이브러리 (재사용 가능)
│       ├── index.ts               # 공통 인터페이스
│       ├── errors.ts              # 에러 클래스 및 유틸리티
│       ├── kakao.ts               # 카카오 OAuth 구현
│       ├── naver.ts               # 네이버 OAuth 구현
│       └── google.ts              # 구글 OAuth 구현
├── backend/                        # Python FastAPI 백엔드 (선택)
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/
│   │   │   └── auth.py
│   │   ├── services/
│   │   │   └── oauth.py
│   │   └── models/
│   │       └── user.py
│   └── requirements.txt
├── ARCHITECTURE.md                 # 아키텍처 문서 ⭐
├── CODING_GUIDELINES.md            # 코딩 규칙 ⭐
├── ERROR_HANDLING.md               # 에러 처리 가이드 ⭐
├── CONTRIBUTING.md                 # 기여 가이드 ⭐
├── QUICKSTART.md                   # 빠른 시작 가이드
├── package.json
├── tsconfig.json
└── README.md
```

⭐ 표시된 문서들은 프로젝트의 재사용성과 확장성을 위한 핵심 문서입니다.

## 빠른 시작

### 1. 의존성 설치

#### Next.js (프론트엔드)

```bash
npm install
```

#### Python Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. 환경 변수 설정

#### Next.js (`.env.local`)

```bash
# 카카오 OAuth
KAKAO_CLIENT_ID=your_kakao_rest_api_key
KAKAO_CLIENT_SECRET=your_kakao_client_secret
KAKAO_REDIRECT_URI=http://localhost:3000/api/auth/callback?provider=kakao

# 네이버 OAuth
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
NAVER_REDIRECT_URI=http://localhost:3000/api/auth/callback?provider=naver

# 구글 OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback?provider=google

# 앱 URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# N8N 웹훅 (선택사항)
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/oauth-callback
```

#### Python Backend (`backend/.env`)

```bash
# backend/.env.example을 복사하여 backend/.env 생성
cp backend/.env.example backend/.env
# 그리고 실제 값으로 업데이트
```

### 3. 개발 서버 실행

#### Next.js

```bash
npm run dev
```

브라우저에서 http://localhost:3000 열기

#### Python Backend

```bash
cd backend
python -m uvicorn app.main:app --reload
```

API 문서: http://localhost:8000/docs

## OAuth 제공자 설정

### 카카오 개발자 설정

1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 애플리케이션 추가
3. REST API 키 확인 → `KAKAO_CLIENT_ID`
4. Client Secret 생성 → `KAKAO_CLIENT_SECRET`
5. Redirect URI 등록: `http://localhost:3000/api/auth/callback?provider=kakao`
6. 동의 항목 설정 (닉네임, 이메일 등)

### 네이버 개발자 설정

1. [Naver Developers](https://developers.naver.com/) 접속
2. 애플리케이션 등록
3. Client ID, Client Secret 확인
4. Callback URL 설정: `http://localhost:3000/api/auth/callback?provider=naver`
5. 사용 API: 네이버 로그인 선택

### 구글 개발자 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성
3. OAuth 2.0 클라이언트 ID 생성 (웹 애플리케이션)
4. 승인된 리디렉션 URI: `http://localhost:3000/api/auth/callback?provider=google`
5. Client ID, Client Secret 복사

자세한 설정 방법은 [.claude/skills/oauth-social-auth/CONFIG.md](.claude/skills/oauth-social-auth/CONFIG.md) 참조

## 사용 방법

### Next.js 프론트엔드

```typescript
import SocialLoginButtons from '@/components/SocialLoginButtons';

export default function LoginPage() {
  return (
    <div>
      <h1>로그인</h1>
      <SocialLoginButtons />
    </div>
  );
}
```

### API 직접 호출

```typescript
// 로그인 시작
window.location.href = '/api/auth/kakao';  // 또는 naver, google

// 콜백에서 사용자 정보 받기
// /auth/success?user=... 페이지로 리다이렉트됨
```

### Python Backend 사용

```python
# 프론트엔드에서 Python backend 사용 시
# NEXT_PUBLIC_API_URL=http://localhost:8000 설정

# 로그인 시작
window.location.href = 'http://localhost:8000/api/auth/kakao';
```

## Claude Code 스킬 사용

이 프로젝트에는 Claude Code 스킬이 포함되어 있어, Claude에게 자연어로 요청만 하면 소셜 로그인 코드를 자동으로 생성할 수 있습니다.

### 스킬 사용 예제

```
"카카오 로그인 구현해줘"
"네이버 OAuth 추가해줘"
"구글 소셜 로그인 만들어줘"
```

Claude가 자동으로 필요한 코드를 생성하고 설정 방법을 알려줍니다.

### 스킬 위치

- 프로젝트 스킬: `.claude/skills/oauth-social-auth/`
- 개인 스킬로 사용하려면: `~/.claude/skills/`로 복사

## N8N 워크플로우 통합

N8N을 사용하여 소셜 로그인 이벤트를 자동화할 수 있습니다.

### N8N 워크플로우 임포트

1. N8N 대시보드 열기
2. Workflows → Import from File
3. `.claude/skills/oauth-social-auth/N8N_WORKFLOW.json` 선택
4. 각 노드의 자격 증명 설정 (Slack, Google Sheets 등)
5. Webhook URL 복사하여 환경 변수에 설정

### 지원되는 자동화

- 신규 사용자 등록 시 Slack/Discord 알림
- Google Sheets에 사용자 목록 자동 저장
- Mailchimp 등 이메일 마케팅 리스트 자동 추가
- CRM 시스템 자동 동기화

## API 문서

### Next.js API Routes

- `GET /api/auth/[provider]` - OAuth 로그인 시작
- `GET /api/auth/callback` - OAuth 콜백 처리

### Python FastAPI

- `GET /api/auth/{provider}` - OAuth 로그인 시작
- `GET /api/auth/{provider}/callback` - OAuth 콜백 처리
- `GET /health` - 헬스 체크

FastAPI 자동 문서: http://localhost:8000/docs

## 보안

### 필수 보안 조치

- ✅ Client Secret은 환경 변수로 관리
- ✅ HTTPS 사용 (프로덕션)
- ✅ State 파라미터로 CSRF 방지
- ✅ HttpOnly 쿠키 사용
- ✅ 토큰은 서버 측에서만 처리

### 프로덕션 배포 시

1. 환경 변수를 안전하게 관리 (AWS Secrets Manager, Vault 등)
2. HTTPS 필수 사용
3. Redirect URI를 프로덕션 도메인으로 변경
4. CORS 설정 검토
5. Rate limiting 적용

## 문제 해결

### redirect_uri_mismatch 오류

개발자 콘솔에 등록한 Redirect URI와 코드의 URI가 정확히 일치하는지 확인하세요.

```
http://localhost:3000/api/auth/callback?provider=kakao
```

프로토콜(http/https), 포트, 경로, 쿼리 파라미터까지 모두 일치해야 합니다.

### invalid_client 오류

Client ID와 Client Secret이 올바른지, 환경 변수가 제대로 로드되는지 확인하세요.

### CORS 오류

프론트엔드와 백엔드가 다른 포트에서 실행 중이라면, 백엔드의 CORS 설정을 확인하세요.

## 에러 처리

이 프로젝트는 견고한 에러 처리 메커니즘을 갖추고 있습니다.

### 주요 기능

- ✅ **타임아웃 처리**: 모든 API 요청에 10초 타임아웃 적용
- ✅ **자동 재시도**: 네트워크 오류 시 최대 3회 자동 재시도 (지수 백오프)
- ✅ **커스텀 에러 클래스**: 에러 종류별 명확한 분류 및 처리
- ✅ **사용자 친화적 메시지**: 기술적 에러를 이해하기 쉬운 메시지로 변환
- ✅ **구조화된 로깅**: 에러 추적 및 디버깅 용이
- ✅ **OAuth 에러 처리**: access_denied 등 표준 OAuth 에러 파라미터 처리
- ✅ **응답 검증**: API 응답 구조 검증으로 런타임 에러 방지

### 에러 종류

| 에러 | 설명 | 사용자 메시지 |
|------|------|--------------|
| `MissingConfigError` | 환경 변수 누락 | "○○ 로그인 설정이 완료되지 않았습니다" |
| `NetworkError` | 네트워크 오류 | "네트워크 연결에 문제가 있습니다" |
| `TimeoutError` | 요청 시간 초과 | "요청 시간이 초과되었습니다" |
| `TokenRequestError` | 토큰 요청 실패 | "로그인 처리 중 오류가 발생했습니다" |
| `UserInfoError` | 사용자 정보 실패 | "사용자 정보를 가져오는데 실패했습니다" |
| `UserDeniedError` | 사용자 권한 거부 | "로그인이 취소되었습니다" |
| `InvalidStateError` | CSRF 검증 실패 | "보안 검증에 실패했습니다" |

### 자세한 내용

에러 처리에 대한 자세한 내용은 [ERROR_HANDLING.md](ERROR_HANDLING.md)를 참조하세요.

## TODO (향후 개선 사항)

### 대기열 시스템 아키텍처 개선

현재 WebSocket 기반 대기열 시스템은 약 2,000개 동시 연결까지 지원합니다. 대규모 트래픽 처리를 위해 다음 아키텍처 개선을 검토합니다.

#### Option 1: Polling + SSE 하이브리드 (권장)

```
[사용자] → [Polling 5초] → [API 서버] → [Redis Queue]
              ↓
         position <= 10이면
              ↓
[사용자] ← [SSE 실시간] ← [API 서버]
```

**장점:**
- WebSocket 연결 수 80% 감소
- 기존 인프라 활용 가능
- 점진적 마이그레이션 가능

**구현 포인트:**
- 대기 순서 10번 이내일 때만 SSE 연결
- Redis를 이용한 대기열 상태 관리
- 폴링 간격 동적 조절 (순서가 가까워지면 짧게)

#### Option 2: 대기열 마이크로서비스 분리

```
[API 서버] ←→ [Queue Service] ←→ [Redis Cluster]
                    ↓
            [Socket.IO Server]
                    ↓
               [사용자들]
```

**장점:**
- 10,000+ 동시 연결 지원
- 대기열 로직 독립적 스케일링
- 장애 격리

**구현 포인트:**
- Socket.IO + Redis Adapter 사용
- Kubernetes HPA로 자동 스케일링
- 대기열 서비스 별도 배포

---

## 라이선스

MIT

## 개발 가이드

### 프로젝트 문서

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - 아키텍처 설계, 패턴, 확장 가이드
- **[CODING_GUIDELINES.md](CODING_GUIDELINES.md)** - 코딩 규칙 및 베스트 프랙티스
- **[ERROR_HANDLING.md](ERROR_HANDLING.md)** - 에러 처리 메커니즘
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - 기여 가이드
- **[docs/adr/](docs/adr/)** - Architecture Decision Records

### 새 OAuth 제공자 추가하기

스캐폴딩 스크립트를 사용하면 30분 내에 새 제공자를 추가할 수 있습니다:

```bash
./.claude/scripts/new-oauth-provider.sh facebook
```

자세한 내용은 [CONTRIBUTING.md](CONTRIBUTING.md#새-oauth-제공자-추가-가이드)를 참조하세요.

### 코드 템플릿

- **OAuth Provider**: `.claude/templates/oauth-provider.template.ts`
- **ADR Template**: `docs/adr/template.md`

## 기여

이슈 및 PR은 언제나 환영합니다!

기여하기 전에 [CONTRIBUTING.md](CONTRIBUTING.md)를 읽어주세요.

## 참고 자료

- [카카오 로그인 공식 문서](https://developers.kakao.com/docs/latest/ko/kakaologin/common)
- [네이버 로그인 API](https://developers.naver.com/docs/login/overview/overview.md)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [OAuth 2.0 RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749)
- [Next.js 문서](https://nextjs.org/docs)
- [FastAPI 문서](https://fastapi.tiangolo.com/)
- [N8N 문서](https://docs.n8n.io/)
