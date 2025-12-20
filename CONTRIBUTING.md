# 기여 가이드

이 프로젝트에 기여해 주셔서 감사합니다! 이 문서는 기여 과정을 안내합니다.

## 목차

1. [시작하기](#시작하기)
2. [개발 환경 설정](#개발-환경-설정)
3. [기여 프로세스](#기여-프로세스)
4. [코딩 규칙](#코딩-규칙)
5. [테스트](#테스트)
6. [Pull Request](#pull-request)
7. [이슈 작성](#이슈-작성)

## 시작하기

### 기여할 수 있는 방법

- 🐛 버그 리포트
- ✨ 새로운 기능 제안
- 📝 문서 개선
- 🎨 UI/UX 개선
- ✅ 테스트 추가
- 🌐 새로운 OAuth 제공자 추가

### 행동 강령

- 존중하고 건설적인 피드백 제공
- 다양성과 포용성 존중
- 프로페셔널한 태도 유지

## 개발 환경 설정

### 1. Repository Fork

```bash
# GitHub에서 Fork 버튼 클릭
# 로컬에 클론
git clone https://github.com/YOUR_USERNAME/auction-001.git
cd auction-001
```

### 2. 의존성 설치

```bash
# Node.js 의존성
npm install

# Python Backend (선택사항)
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. 환경 변수 설정

```bash
cp .env.local .env.local
# .env.local 파일을 열어 OAuth 키 설정
```

### 4. 개발 서버 실행

```bash
npm run dev
# http://localhost:3000
```

### 5. 빌드 및 테스트

```bash
npm run build     # 프로덕션 빌드
npm run lint      # Linting
npm run test      # 테스트 실행
```

## 기여 프로세스

### 1. 이슈 확인

기여하기 전에 다음을 확인하세요:

- [ ] 관련 이슈가 이미 존재하는가?
- [ ] 이 기여가 프로젝트 목표와 일치하는가?
- [ ] Breaking change인가?

이슈가 없다면 먼저 이슈를 생성하세요.

### 2. 브랜치 생성

```bash
git checkout -b feature/new-oauth-provider
# 또는
git checkout -b fix/login-error
```

**브랜치 네이밍 규칙**:
- `feature/` - 새로운 기능
- `fix/` - 버그 수정
- `docs/` - 문서 변경
- `refactor/` - 리팩토링
- `test/` - 테스트 추가/수정

### 3. 변경사항 작성

#### 새 OAuth 제공자 추가 (예시)

```bash
# 스캐폴딩 스크립트 사용
./.claude/scripts/new-oauth-provider.sh facebook

# 또는 수동으로
# 1. src/lib/auth/facebook.ts 생성
# 2. src/app/api/auth/[provider]/route.ts 업데이트
# 3. src/app/api/auth/callback/route.ts 업데이트
# 4. 테스트 작성
# 5. 문서 업데이트
```

#### 코딩 규칙 준수

[CODING_GUIDELINES.md](./CODING_GUIDELINES.md)를 따라주세요.

주요 규칙:
- TypeScript strict mode 사용
- 명시적 타입 선언
- ESLint 규칙 준수
- 커스텀 에러 클래스 사용
- 민감 정보 로깅 금지

### 4. 테스트 작성

```typescript
// src/lib/auth/__tests__/facebook.test.ts
describe('FacebookOAuthProvider', () => {
  it('should generate correct authorization URL', () => {
    const provider = new FacebookOAuthProvider();
    const url = provider.getAuthorizationUrl('test-state');

    expect(url).toContain('facebook.com');
    expect(url).toContain('state=test-state');
  });

  it('should handle token request error', async () => {
    // Mock 설정
    // 테스트 로직
  });
});
```

### 5. 커밋

```bash
git add .
git commit -m "feat(oauth): add Facebook OAuth provider

Implement FacebookOAuthProvider with:
- Authorization URL generation
- Token exchange
- User info retrieval
- Error handling

Closes #123"
```

**커밋 메시지 규칙**:
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type**:
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `docs`: 문서
- `style`: 포맷팅
- `refactor`: 리팩토링
- `test`: 테스트
- `chore`: 빌드/설정

### 6. Push 및 Pull Request

```bash
git push origin feature/new-oauth-provider
```

GitHub에서 Pull Request 생성

## 코딩 규칙

### TypeScript

```typescript
// ✅ 좋은 예
function getUser(id: string): Promise<User> {
  return fetchUser(id);
}

// ❌ 나쁜 예
function getUser(id: any): any {
  return fetchUser(id);
}
```

### 에러 처리

```typescript
// ✅ 커스텀 에러 사용
throw new TokenRequestError('Facebook', 'invalid_grant', 'Code expired');

// ❌ 일반 Error
throw new Error('Token request failed');
```

### 네이밍

```typescript
// 변수/함수: camelCase
const accessToken = 'token';
function getUserInfo() { }

// 상수: UPPER_SNAKE_CASE
const MAX_RETRIES = 3;

// 클래스/타입: PascalCase
class FacebookOAuthProvider { }
interface TokenResponse { }
```

자세한 내용은 [CODING_GUIDELINES.md](./CODING_GUIDELINES.md) 참조

## 테스트

### 테스트 작성 가이드

```typescript
describe('ComponentName', () => {
  // Arrange - Act - Assert 패턴

  it('should do something when condition', () => {
    // Arrange: 테스트 설정
    const provider = new FacebookOAuthProvider();

    // Act: 테스트 실행
    const result = provider.getAuthorizationUrl('state');

    // Assert: 검증
    expect(result).toBeDefined();
  });
});
```

### 테스트 실행

```bash
npm run test              # 모든 테스트
npm run test:watch        # Watch 모드
npm run test:coverage     # 커버리지
```

### 테스트 커버리지

- 새로운 기능은 80% 이상 커버리지 목표
- 중요한 비즈니스 로직은 100% 커버리지

## Pull Request

### PR 체크리스트

기본:
- [ ] 관련 이슈 번호 포함 (Closes #123)
- [ ] 코딩 가이드라인 준수
- [ ] 테스트 작성 및 통과
- [ ] 빌드 성공 (`npm run build`)
- [ ] Lint 통과 (`npm run lint`)

문서:
- [ ] README 업데이트 (필요시)
- [ ] ARCHITECTURE.md 업데이트 (구조 변경 시)
- [ ] ADR 작성 (주요 결정 시)
- [ ] CHANGELOG 업데이트

Breaking Changes:
- [ ] Breaking change 명시
- [ ] 마이그레이션 가이드 작성
- [ ] 버전 업데이트 계획

### PR 템플릿

```markdown
## 변경사항
[변경사항 요약]

## 동기
[왜 이 변경이 필요한가?]

## 변경 내용
- 변경 1
- 변경 2

## 테스트
[어떻게 테스트했는가?]

## 스크린샷
[UI 변경 시 Before/After 스크린샷]

## 체크리스트
- [ ] 테스트 작성 및 통과
- [ ] 문서 업데이트
- [ ] 코딩 가이드라인 준수

## 관련 이슈
Closes #123
```

### 리뷰 프로세스

1. **자동 검사**: CI/CD 파이프라인 통과
2. **코드 리뷰**: 최소 1명의 승인 필요
3. **수정**: 리뷰 코멘트에 따라 수정
4. **머지**: Squash merge 사용

## 이슈 작성

### 버그 리포트

```markdown
**버그 설명**
[버그에 대한 명확한 설명]

**재현 방법**
1. '...' 로 이동
2. '....' 클릭
3. '....' 스크롤
4. 에러 발생

**예상 동작**
[무엇이 일어나야 하는가?]

**실제 동작**
[무엇이 일어났는가?]

**스크린샷**
[가능하면 스크린샷 첨부]

**환경**
- OS: [예: macOS 14.0]
- Browser: [예: Chrome 120]
- Version: [예: 1.0.0]

**추가 컨텍스트**
[기타 정보]
```

### 기능 제안

```markdown
**기능 설명**
[기능에 대한 명확한 설명]

**동기**
[왜 이 기능이 필요한가?]

**제안하는 해결책**
[어떻게 구현할 것인가?]

**대안**
[고려한 다른 방법들]

**추가 컨텍스트**
[Mock-up, 예시 등]
```

## 새 OAuth 제공자 추가 가이드

### 1. 스캐폴딩 스크립트 사용

```bash
./.claude/scripts/new-oauth-provider.sh facebook

# 입력 프롬프트에 답변:
# - Authorization URL: https://www.facebook.com/v18.0/dialog/oauth
# - Token URL: https://graph.facebook.com/v18.0/oauth/access_token
# - User Info URL: https://graph.facebook.com/me
# - Documentation URL: https://developers.facebook.com/docs/facebook-login
# - Default Scope: email,public_profile
# - User ID field: id
# - Email field: email
# - Name field: name
# - Profile image field: picture.data.url
```

### 2. 생성된 파일 확인

- `src/lib/auth/facebook.ts`: OAuth Provider 구현
- `.env.local`: 환경 변수 템플릿 추가됨

### 3. 라우트 업데이트

```typescript
// src/app/api/auth/[provider]/route.ts
import { FacebookOAuthProvider } from '@/lib/auth/facebook';

const providers = {
  kakao: KakaoOAuthProvider,
  naver: NaverOAuthProvider,
  google: GoogleOAuthProvider,
  facebook: FacebookOAuthProvider, // 추가
};
```

```typescript
// src/app/api/auth/callback/route.ts
// 동일하게 import 및 등록
```

### 4. UI 추가

```typescript
// src/components/SocialLoginButtons.tsx
<button onClick={() => handleLogin('facebook')}>
  Facebook으로 계속하기
</button>
```

### 5. 테스트 작성

```typescript
// src/lib/auth/__tests__/facebook.test.ts
describe('FacebookOAuthProvider', () => {
  // 테스트 작성
});
```

### 6. 문서 업데이트

- README.md: 지원 제공자 목록에 추가
- ARCHITECTURE.md: 예시 업데이트 (필요시)

### 7. ADR 작성 (선택)

주요 결정사항이 있다면 ADR 작성:

```bash
# docs/adr/0005-facebook-oauth.md
```

## 질문이 있나요?

- 📧 이메일: support@example.com
- 💬 Discord: [링크]
- 📝 이슈: [GitHub Issues](https://github.com/yourname/auction-001/issues)

## 라이선스

기여한 코드는 프로젝트의 라이선스(MIT)를 따릅니다.

## 감사합니다!

여러분의 기여가 프로젝트를 더 좋게 만듭니다. 🎉
