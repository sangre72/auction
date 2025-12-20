# OAuth 인증 테스트 가이드

## 목차
1. [수동 테스트](#수동-테스트)
2. [유닛 테스트](#유닛-테스트)
3. [E2E 테스트](#e2e-테스트)
4. [테스트 제거 방법](#테스트-제거-방법)

---

## 수동 테스트

### 1. 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 설정하세요:

```bash
# 앱 URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 카카오
KAKAO_CLIENT_ID=your_kakao_app_key
KAKAO_CLIENT_SECRET=your_kakao_client_secret
KAKAO_REDIRECT_URI=http://localhost:3000/api/auth/callback?provider=kakao

# 네이버
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret
NAVER_REDIRECT_URI=http://localhost:3000/api/auth/callback?provider=naver

# 구글
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback?provider=google
```

### 2. 개발자 콘솔 설정

#### 카카오
1. [카카오 개발자 콘솔](https://developers.kakao.com) 접속
2. 애플리케이션 생성 또는 선택
3. **카카오 로그인** > **활성화** 설정
4. **Redirect URI** 등록: `http://localhost:3000/api/auth/callback?provider=kakao`
5. **동의 항목**에서 이메일, 프로필 정보 설정

#### 네이버
1. [네이버 개발자 센터](https://developers.naver.com) 접속
2. 애플리케이션 등록
3. **사용 API**: 네이버 로그인 선택
4. **서비스 URL**: `http://localhost:3000`
5. **Callback URL**: `http://localhost:3000/api/auth/callback?provider=naver`

#### 구글
1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 프로젝트 생성 또는 선택
3. **API 및 서비스** > **사용자 인증 정보**
4. **OAuth 2.0 클라이언트 ID** 생성
5. **승인된 리디렉션 URI**: `http://localhost:3000/api/auth/callback?provider=google`

### 3. 테스트 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속 후:

1. **정상 로그인 테스트**
   - 각 소셜 로그인 버튼 클릭
   - 해당 서비스 로그인 페이지로 이동 확인
   - 로그인 후 성공 페이지(`/auth/success`)로 리다이렉트 확인
   - 사용자 정보가 올바르게 표시되는지 확인

2. **로그인 거부 테스트**
   - 소셜 로그인 화면에서 취소 버튼 클릭
   - 에러 페이지(`/auth/error?reason=user_denied`)로 이동 확인

3. **잘못된 state 테스트**
   - 브라우저 개발자 도구에서 `oauth_state` 쿠키 삭제
   - 콜백 URL 직접 접속 시 에러 페이지 표시 확인

### 4. 디버깅 팁

- 브라우저 개발자 도구의 Network 탭에서 OAuth 요청 확인
- 서버 콘솔에서 에러 로그 확인
- `.env.local` 파일이 올바르게 로드되었는지 확인

---

## 유닛 테스트

### 실행 방법

```bash
# 전체 테스트 실행
npm test

# Watch 모드 (파일 변경 시 자동 실행)
npm run test:watch

# 커버리지 리포트 생성
npm run test:coverage
```

### 테스트 파일 위치

```
__tests__/
├── setup.ts                     # 테스트 환경 설정
└── unit/
    └── lib/auth/
        ├── kakao.test.ts        # 카카오 OAuth 테스트
        ├── naver.test.ts        # 네이버 OAuth 테스트
        └── google.test.ts       # 구글 OAuth 테스트
```

### 테스트 항목

- **getAuthorizationUrl()**: OAuth 인증 URL 생성 검증
- **getAccessToken()**: 토큰 요청/응답 처리 테스트
- **getUserInfo()**: 사용자 정보 파싱 테스트
- **에러 케이스**: 네트워크 에러, 잘못된 응답 등

---

## E2E 테스트

### 실행 방법

```bash
# Playwright 브라우저 설치 (최초 1회)
npx playwright install chromium

# E2E 테스트 실행
npm run test:e2e

# UI 모드로 실행 (디버깅에 유용)
npm run test:e2e:ui
```

### 테스트 파일 위치

```
__tests__/
└── e2e/
    └── auth.spec.ts             # OAuth 흐름 E2E 테스트
```

### 테스트 항목

- 홈페이지 로그인 버튼 표시 확인
- 버튼 클릭 시 OAuth URL로 이동 확인
- 성공/에러 페이지 표시 확인

---

## 테스트 제거 방법

테스트가 더 이상 필요하지 않을 경우:

### 1. 파일 삭제

```bash
# 테스트 관련 파일/폴더 삭제
rm -rf __tests__
rm jest.config.js
rm playwright.config.ts
rm -rf coverage
rm -rf playwright-report
rm -rf test-results
```

### 2. 패키지 제거

```bash
npm uninstall -D jest @types/jest ts-jest jest-environment-jsdom @playwright/test
```

### 3. package.json 정리

`package.json`에서 다음 스크립트 제거:
```json
{
  "scripts": {
    "test": "...",
    "test:watch": "...",
    "test:coverage": "...",
    "test:e2e": "...",
    "test:e2e:ui": "..."
  }
}
```

### 4. (선택) 문서 삭제

```bash
rm docs/TESTING.md
```
