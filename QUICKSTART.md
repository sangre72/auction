# 빠른 시작 가이드

이 가이드는 5분 안에 소셜 로그인을 테스트할 수 있도록 도와줍니다.

## 1단계: 프로젝트 설치

```bash
# 의존성 설치
npm install

# 환경 변수 파일 생성
cp .env.local .env.local
```

## 2단계: 최소 설정 (카카오만 테스트)

카카오 로그인만 먼저 테스트해봅시다.

### 2.1 카카오 개발자 앱 생성

1. https://developers.kakao.com/ 접속
2. 로그인 → "내 애플리케이션" → "애플리케이션 추가하기"
3. 앱 이름 입력 (예: "테스트 앱")

### 2.2 카카오 REST API 키 복사

1. 앱 설정 → 앱 키
2. "REST API 키" 복사

### 2.3 리다이렉트 URI 설정

1. 제품 설정 → 카카오 로그인
2. "활성화 설정" ON
3. Redirect URI 등록:
   ```
   http://localhost:3000/api/auth/callback
   ```

### 2.4 환경 변수 설정

`.env.local` 파일 열기:

```bash
# 카카오 OAuth (필수)
KAKAO_CLIENT_ID=여기에_복사한_REST_API_키_붙여넣기
KAKAO_CLIENT_SECRET=
KAKAO_REDIRECT_URI=http://localhost:3000/api/auth/callback?provider=kakao

# 나머지는 일단 비워두기
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
NAVER_REDIRECT_URI=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

# 앱 URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**참고**: `KAKAO_CLIENT_SECRET`는 선택사항입니다. 보안 강화를 원하면 다음과 같이 생성:
1. 앱 설정 → 보안
2. Client Secret 코드 생성
3. 복사하여 환경 변수에 추가

## 3단계: 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 열기

## 4단계: 테스트

1. 홈페이지에서 "카카오로 계속하기" 버튼 클릭
2. 카카오 로그인 페이지로 이동
3. 카카오 계정으로 로그인
4. 동의 화면에서 "동의하고 계속하기"
5. 성공 페이지로 리다이렉트되면서 사용자 정보 표시

## 5단계: 다른 제공자 추가 (선택사항)

### 네이버 추가

1. https://developers.naver.com/ 접속
2. Application → 애플리케이션 등록
3. 사용 API: 네이버 로그인 선택
4. 서비스 URL: `http://localhost:3000`
5. Callback URL: `http://localhost:3000/api/auth/callback`
6. Client ID, Client Secret 복사하여 `.env.local`에 추가

### 구글 추가

1. https://console.cloud.google.com/ 접속
2. 프로젝트 생성
3. API 및 서비스 → 사용자 인증 정보
4. OAuth 2.0 클라이언트 ID 생성
5. 애플리케이션 유형: 웹 애플리케이션
6. 승인된 리디렉션 URI: `http://localhost:3000/api/auth/callback`
7. Client ID, Client Secret 복사하여 `.env.local`에 추가

## 문제 해결

### "redirect_uri_mismatch" 오류

**원인**: 개발자 콘솔에 등록한 URI와 다름

**해결**:
1. 개발자 콘솔에서 정확한 URI 확인
2. 쿼리 파라미터 포함 여부 확인 (`?provider=kakao`)
3. 프로토콜 확인 (http vs https)

### "Client not found" 오류

**원인**: Client ID가 잘못되었거나 환경 변수가 로드되지 않음

**해결**:
1. `.env.local` 파일이 프로젝트 루트에 있는지 확인
2. Client ID를 다시 복사하여 붙여넣기
3. 개발 서버 재시작 (`npm run dev` 중단 후 재실행)

### 로그인 후 아무 일도 일어나지 않음

**원인**: 콜백 처리 오류

**해결**:
1. 브라우저 개발자 도구 (F12) → Console 탭 확인
2. Network 탭에서 `/api/auth/callback` 요청 확인
3. 터미널에서 서버 로그 확인

### Next.js 서버가 시작되지 않음

**원인**: 의존성이 설치되지 않음

**해결**:
```bash
# node_modules 삭제하고 재설치
rm -rf node_modules package-lock.json
npm install
```

## 다음 단계

### Python Backend 실행 (AI 기능 추가 시)

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# .env 파일 수정
python -m uvicorn app.main:app --reload
```

### N8N 워크플로우 통합

1. N8N 설치 및 실행
2. `.claude/skills/oauth-social-auth/N8N_WORKFLOW.json` 임포트
3. 각 노드 설정 (Slack, Google Sheets 등)
4. Webhook URL을 `.env.local`의 `N8N_WEBHOOK_URL`에 추가

### 데이터베이스 연동

사용자 정보를 저장하려면 데이터베이스를 연동하세요:

```typescript
// src/app/api/auth/callback/route.ts
import { db } from '@/lib/db';

// 사용자 저장 또는 업데이트
const user = await db.user.upsert({
  where: {
    provider_providerId: {
      provider: userInfo.provider,
      providerId: userInfo.id,
    }
  },
  update: {
    email: userInfo.email,
    name: userInfo.name,
    profileImage: userInfo.profileImage,
  },
  create: {
    provider: userInfo.provider,
    providerId: userInfo.id,
    email: userInfo.email,
    name: userInfo.name,
    profileImage: userInfo.profileImage,
  },
});
```

## 유용한 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm run start

# 린트
npm run lint

# Python backend 실행
cd backend && python -m uvicorn app.main:app --reload
```

## 추가 도움말

- 자세한 설정: [CONFIG.md](.claude/skills/oauth-social-auth/CONFIG.md)
- 코드 예제: [EXAMPLES.md](.claude/skills/oauth-social-auth/EXAMPLES.md)
- Claude Code 스킬: [SKILL.md](.claude/skills/oauth-social-auth/SKILL.md)

## 성공!

이제 소셜 로그인이 작동합니다! 🎉

다음은 프로덕션 배포를 위한 체크리스트입니다:
- [ ] HTTPS 설정
- [ ] 환경 변수를 안전한 곳에 저장
- [ ] Redirect URI를 프로덕션 도메인으로 변경
- [ ] 데이터베이스 연동
- [ ] 세션 관리 (JWT 등)
- [ ] 에러 로깅
- [ ] Rate limiting
