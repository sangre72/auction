# ADR-0002: OAuth Provider 인터페이스 설계

## 상태

승인됨

날짜: 2024-12-20

## 컨텍스트

여러 OAuth 제공자(카카오, 네이버, 구글 등)를 지원해야 하는데, 각 제공자마다 API 구조가 다릅니다:

- **카카오**: REST API 키 기반, 특수한 응답 구조
- **네이버**: state 파라미터 필수, resultcode 기반 응답
- **구글**: 표준 OAuth 2.0, scope 기반 권한

이러한 차이점을 어떻게 처리할 것인가?

## 결정

**Strategy Pattern을 사용한 공통 인터페이스 정의**

```typescript
interface OAuthProvider {
  name: string;
  getAuthorizationUrl(state: string): string;
  getAccessToken(code: string, state?: string): Promise<TokenResponse>;
  getUserInfo(accessToken: string): Promise<UserInfo>;
}
```

각 제공자는 이 인터페이스를 구현하고, 내부 로직은 자유롭게 구현합니다.

## 근거

### Strategy Pattern 선택 이유

1. **확장성**
   - 새 제공자 추가 시 기존 코드 수정 불필요
   - 인터페이스만 구현하면 됨

2. **일관성**
   - 모든 제공자가 동일한 방식으로 사용됨
   - API Route에서 통일된 방식으로 처리

3. **테스트 용이성**
   - Mock Provider를 쉽게 만들 수 있음
   - 각 제공자를 독립적으로 테스트

### 인터페이스 메서드 선택

#### `getAuthorizationUrl(state: string): string`
- **목적**: OAuth 인증 페이지 URL 생성
- **왜 필요한가**: 각 제공자마다 URL 형식이 다름
- **반환값**: 완성된 URL 문자열

#### `getAccessToken(code: string, state?: string): Promise<TokenResponse>`
- **목적**: 인가 코드로 액세스 토큰 교환
- **state 파라미터**: 일부 제공자(네이버)에서 필수
- **비동기**: API 호출이 필요하므로 Promise 반환

#### `getUserInfo(accessToken: string): Promise<UserInfo>`
- **목적**: 토큰으로 사용자 정보 조회
- **표준화된 반환**: UserInfo 인터페이스로 정규화

### 장점

- ✅ 새 OAuth 제공자 추가가 간단
- ✅ 코드 재사용성 향상
- ✅ 테스트가 쉬움
- ✅ 각 제공자의 특수성을 캡슐화
- ✅ API Route 코드가 단순해짐

### 단점

- ❌ 모든 제공자가 이 패턴에 맞지 않을 수 있음
- ❌ 인터페이스 변경 시 모든 구현체 수정 필요

## 고려한 대안들

### 대안 1: 단일 OAuth 클래스 + 설정 기반

```typescript
class OAuthClient {
  constructor(config: OAuthConfig) { }
  async authenticate(provider: string) { }
}
```

- **장점**: 코드 중복 감소
- **단점**: 제공자별 특수 로직 처리 어려움, 유연성 부족
- **채택하지 않은 이유**: 각 제공자의 차이점이 너무 큼

### 대안 2: 상속 기반 계층 구조

```typescript
abstract class BaseOAuthProvider {
  abstract getAccessToken();
}

class KakaoProvider extends BaseOAuthProvider { }
```

- **장점**: 공통 로직 재사용
- **단점**: 상속 계층이 복잡해질 수 있음, 유연성 부족
- **채택하지 않은 이유**: Composition over Inheritance 원칙

### 대안 3: 함수형 접근

```typescript
const kakaoOAuth = {
  getAuthUrl: (state) => { },
  getToken: (code) => { },
};
```

- **장점**: 단순함
- **단점**: 타입 안전성 부족, 확장성 낮음
- **채택하지 않은 이유**: TypeScript의 이점 활용 부족

## 결과

### 긍정적 영향

1. **개발 속도 향상**
   - 템플릿을 사용하여 새 제공자 30분 내 추가 가능
   - 스캐폴딩 스크립트로 자동화

2. **코드 품질**
   - 일관된 에러 처리
   - 통일된 로깅 구조

3. **유지보수성**
   - 각 제공자를 독립적으로 수정 가능
   - 버그 수정이 다른 제공자에 영향 없음

### 부정적 영향

1. **보일러플레이트**
   - 각 제공자마다 비슷한 코드 반복
   - 완화: 템플릿과 스크립트로 자동화

2. **인터페이스 확장의 어려움**
   - 토큰 갱신 등 새 기능 추가 시 모든 구현체 수정
   - 완화: Optional 메서드 사용

### 기술 부채

- 인터페이스가 과도하게 확장되면 리팩토링 필요
- 제공자별 특수 기능은 별도 메서드로 추가 필요

## 관련 문서

- [Strategy Pattern - Refactoring Guru](https://refactoring.guru/design-patterns/strategy)
- [ARCHITECTURE.md - Design Patterns](../../ARCHITECTURE.md#디자인-패턴)
- [.claude/templates/oauth-provider.template.ts](../../.claude/templates/oauth-provider.template.ts)
