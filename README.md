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

## 프로젝트 구조

```
auction-001/
├── .claude/
│   └── skills/
│       └── oauth-social-auth/      # Claude Code 스킬
│           ├── SKILL.md
│           ├── EXAMPLES.md
│           ├── CONFIG.md
│           └── N8N_WORKFLOW.json
├── src/                            # Next.js 프론트엔드
│   ├── app/
│   │   ├── api/auth/              # OAuth API Routes
│   │   ├── auth/                  # 인증 페이지
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   └── SocialLoginButtons.tsx
│   └── lib/auth/                  # OAuth 라이브러리
│       ├── index.ts
│       ├── kakao.ts
│       ├── naver.ts
│       └── google.ts
├── backend/                        # Python FastAPI 백엔드
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/
│   │   │   └── auth.py
│   │   ├── services/
│   │   │   └── oauth.py
│   │   └── models/
│   │       └── user.py
│   └── requirements.txt
├── package.json
├── tsconfig.json
└── README.md
```

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

## 라이선스

MIT

## 기여

이슈 및 PR은 언제나 환영합니다!

## 참고 자료

- [카카오 로그인 공식 문서](https://developers.kakao.com/docs/latest/ko/kakaologin/common)
- [네이버 로그인 API](https://developers.naver.com/docs/login/overview/overview.md)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [OAuth 2.0 RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749)
- [Next.js 문서](https://nextjs.org/docs)
- [FastAPI 문서](https://fastapi.tiangolo.com/)
- [N8N 문서](https://docs.n8n.io/)
