---
name: oauth-social-auth
description: 카카오, 네이버, 구글 소셜 로그인 OAuth 코드를 자동으로 생성합니다. Next.js, TypeScript, Python FastAPI를 지원하며, N8N 웹훅 통합도 포함됩니다. 소셜 로그인, OAuth 구현, 카카오 로그인, 네이버 로그인, 구글 로그인이 필요할 때 사용하세요.
---

# OAuth 소셜 인증 코드 생성기

이 스킬은 카카오, 네이버, 구글의 OAuth 2.0 소셜 로그인을 구현하는 코드를 자동으로 생성합니다.

## 사용 방법

이 스킬은 다음과 같은 요청에 자동으로 응답합니다:

- "카카오 로그인 구현해줘"
- "네이버 OAuth 코드 생성"
- "구글 소셜 로그인 추가"
- "소셜 로그인 모듈 만들어줘"
- "OAuth 인증 구현"

## 주요 기능

### 1. 제공자별 코드 생성
- **카카오 (Kakao)**: REST API 키 기반 OAuth 2.0
- **네이버 (Naver)**: 네이버 로그인 OAuth 2.0
- **구글 (Google)**: Google OAuth 2.0 표준 구현

### 2. 다중 플랫폼 지원
- **Next.js + TypeScript**: API Routes 기반 구현
- **Python FastAPI**: 향후 AI 기능 통합을 위한 백엔드
- **N8N 웹훅**: 워크플로우 자동화 통합

### 3. 재사용 가능한 라이브러리
모든 제공자를 위한 공통 인터페이스로 설계된 라이브러리를 생성합니다.

## 생성되는 파일 구조

```
your-project/
├── src/
│   ├── lib/
│   │   └── auth/
│   │       ├── index.ts                 # 공통 인터페이스
│   │       ├── kakao.ts                 # 카카오 OAuth
│   │       ├── naver.ts                 # 네이버 OAuth
│   │       └── google.ts                # 구글 OAuth
│   ├── app/api/auth/
│   │   ├── [...provider]/
│   │   │   └── route.ts                 # Next.js API 라우트
│   │   └── callback/
│   │       └── route.ts                 # OAuth 콜백
├── backend/
│   └── app/
│       ├── routers/
│       │   └── auth.py                  # FastAPI OAuth 라우터
│       └── services/
│           └── oauth.py                 # OAuth 서비스 로직
├── n8n/
│   └── workflows/
│       └── oauth-webhook.json           # N8N 웹훅 템플릿
└── .env.local                           # 환경 변수 템플릿
```

## OAuth 구현 단계

### 1. 환경 설정
각 제공자의 개발자 콘솔에서 앱을 등록하고 클라이언트 ID와 시크릿을 받습니다.

### 2. 코드 생성
이 스킬을 호출하면 필요한 모든 파일이 자동으로 생성됩니다.

### 3. 보안 설정
- 환경 변수에 시크릿 저장
- HTTPS 사용 (프로덕션)
- CSRF 방지를 위한 state 파라미터 검증
- 토큰 안전하게 저장

### 4. 테스트 및 배포
생성된 코드는 즉시 테스트 가능하며, 프로덕션 환경에 배포할 수 있습니다.

## 보안 고려사항

✅ **필수 보안 조치**
- Client Secret은 절대 클라이언트 측 코드에 노출하지 않기
- 모든 OAuth 리다이렉트는 HTTPS 사용
- State 파라미터로 CSRF 공격 방지
- 토큰은 암호화된 데이터베이스나 안전한 세션에 저장
- 적절한 토큰 갱신 메커니즘 구현
- 액세스 토큰을 프론트엔드에 노출하지 않기

## 제공자별 설정 가이드

### 카카오 개발자 설정
1. [Kakao Developers](https://developers.kakao.com/) 접속
2. 애플리케이션 추가
3. REST API 키 확인
4. 플랫폼 설정에서 Redirect URI 등록
5. 동의 항목 설정 (프로필, 이메일 등)

### 네이버 개발자 설정
1. [Naver Developers](https://developers.naver.com/) 접속
2. 애플리케이션 등록
3. Client ID, Client Secret 확인
4. 서비스 URL 및 Callback URL 설정
5. 사용 API 선택 (네이버 로그인)

### 구글 개발자 설정
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성
3. OAuth 2.0 클라이언트 ID 생성 (웹 애플리케이션)
4. 승인된 리디렉션 URI 추가
5. Client ID, Client Secret 복사

## N8N 통합

생성된 N8N 웹훅 템플릿을 사용하여 다음 작업을 자동화할 수 있습니다:

- 신규 사용자 등록 시 Slack/Discord 알림
- CRM 시스템에 사용자 정보 자동 동기화
- 이메일 마케팅 리스트 자동 추가
- 사용자 행동 분석 데이터 수집

## 예제 사용법

자세한 코드 예제는 [EXAMPLES.md](EXAMPLES.md)를 참조하세요.

## API 엔드포인트 및 설정

자세한 설정 정보는 [CONFIG.md](CONFIG.md)를 참조하세요.

## 문제 해결

### 일반적인 오류

**"redirect_uri_mismatch" 오류**
- 개발자 콘솔에 등록한 Redirect URI와 코드의 URI가 정확히 일치하는지 확인
- http://localhost:3000/api/auth/callback 형식으로 등록

**"invalid_client" 오류**
- Client ID와 Client Secret이 정확한지 확인
- 환경 변수 파일(.env.local)이 올바르게 로드되는지 확인

**CORS 오류**
- API 라우트가 올바른 CORS 헤더를 반환하는지 확인
- 프론트엔드와 백엔드의 도메인이 허용 목록에 있는지 확인

## 추가 리소스

- [OAuth 2.0 RFC 6749](https://datatracker.ietf.org/doc/html/rfc6749)
- [카카오 로그인 가이드](https://developers.kakao.com/docs/latest/ko/kakaologin/common)
- [네이버 로그인 가이드](https://developers.naver.com/docs/login/overview/overview.md)
- [Google OAuth 2.0 가이드](https://developers.google.com/identity/protocols/oauth2)
