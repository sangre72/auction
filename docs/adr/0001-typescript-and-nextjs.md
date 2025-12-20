# ADR-0001: TypeScript와 Next.js App Router 선택

## 상태

승인됨

날짜: 2024-12-20

## 컨텍스트

OAuth 소셜 로그인 모듈을 구축하면서 다음 사항을 고려해야 했습니다:

- **타입 안정성**: OAuth 플로우는 여러 단계의 데이터 변환이 필요하며, 타입 오류는 보안 문제로 이어질 수 있음
- **서버 사이드 렌더링**: OAuth 콜백 처리는 서버에서 수행되어야 함
- **확장성**: 향후 다양한 OAuth 제공자 추가 예정
- **개발 생산성**: 빠른 개발과 유지보수 용이성

## 결정

다음 기술 스택을 선택했습니다:

1. **TypeScript**: 정적 타입 시스템 사용
2. **Next.js 15 App Router**: React 기반 풀스택 프레임워크
3. **Strict Mode 활성화**: 최대한의 타입 안전성 확보

## 근거

### TypeScript 선택 이유

1. **타입 안전성**
   ```typescript
   // OAuth 응답 구조를 명확하게 정의
   interface TokenResponse {
     access_token: string;
     refresh_token?: string;
     expires_in?: number;
     token_type: string;
   }
   ```

2. **IDE 지원**
   - 자동완성, 리팩토링 도구
   - 컴파일 시점 에러 감지

3. **문서화**
   - 타입이 문서 역할 수행
   - JSDoc과 결합하여 더 풍부한 문서 제공

### Next.js App Router 선택 이유

1. **서버 컴포넌트**
   - 민감한 OAuth 로직을 서버에서만 실행
   - Client Secret 노출 방지

2. **API Routes**
   - `/api/auth/[provider]` 동적 라우팅
   - 서버리스 함수로 자동 배포

3. **Built-in 최적화**
   - 이미지 최적화
   - 자동 코드 분할
   - 빠른 페이지 로드

4. **개발자 경험**
   - Hot Module Replacement
   - TypeScript 기본 지원
   - 훌륭한 에러 메시지

### 장점

- ✅ 컴파일 시점 타입 체크로 런타임 에러 감소
- ✅ IDE 지원으로 개발 생산성 향상
- ✅ 서버/클라이언트 코드 분리 용이
- ✅ OAuth 민감 정보를 서버에서만 처리 가능
- ✅ 배포 자동화 (Vercel, Netlify 등)
- ✅ 풍부한 생태계와 커뮤니티

### 단점

- ❌ 러닝 커브 (TypeScript 초보자)
- ❌ 빌드 시간 증가
- ❌ Next.js 버전 업그레이드 시 Breaking Changes

## 고려한 대안들

### 대안 1: JavaScript + Express

- **설명**: Node.js + Express로 백엔드만 구축
- **장점**:
  - 단순한 구조
  - 빠른 시작
- **단점**:
  - 타입 안전성 부족
  - 프론트엔드 별도 구축 필요
  - OAuth 플로우에서 타입 오류 위험
- **채택하지 않은 이유**: 타입 안전성이 OAuth에서 중요함

### 대안 2: Python FastAPI

- **설명**: FastAPI로 백엔드 구축
- **장점**:
  - 타입 힌팅 지원
  - 자동 문서화
  - 빠른 성능
- **단점**:
  - 프론트엔드 별도 필요
  - JavaScript 생태계와 통합 어려움
- **채택하지 않은 이유**: 풀스택 구현이 더 효율적
- **참고**: AI 기능 통합을 위해 선택적으로 Python backend 추가

### 대안 3: Next.js Pages Router

- **설명**: Next.js의 기존 Pages Router 사용
- **장점**:
  - 더 안정적 (오래된 API)
  - 더 많은 레퍼런스
- **단점**:
  - 서버 컴포넌트 미지원
  - 미래 지향적이지 않음
  - App Router가 권장됨
- **채택하지 않은 이유**: App Router가 Next.js의 미래

## 결과

### 긍정적 영향

1. **코드 품질 향상**
   - 타입 에러로 인한 버그 80% 감소 (예상)
   - 리팩토링이 안전해짐

2. **개발 속도 향상**
   - 자동완성으로 개발 속도 증가
   - API 구조를 타입으로 빠르게 파악

3. **보안 강화**
   - Client Secret을 서버에서만 처리
   - 타입 체크로 데이터 누출 방지

4. **유지보수성**
   - 새 개발자가 코드를 빠르게 이해
   - 리팩토링 시 영향 범위를 쉽게 파악

### 부정적 영향

1. **빌드 시간**
   - 타입 체크로 빌드 시간 약 20% 증가
   - CI/CD 파이프라인 시간 증가

2. **러닝 커브**
   - TypeScript 초보자는 학습 필요
   - App Router는 상대적으로 새로운 API

### 기술 부채

- Next.js 14→15 업그레이드 시 Breaking Changes 대응 필요
- TypeScript 5.x 버전 업데이트 추적 필요

## 관련 문서

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Next.js App Router](https://nextjs.org/docs/app)
- [ARCHITECTURE.md](../../ARCHITECTURE.md)
- [CODING_GUIDELINES.md](../../CODING_GUIDELINES.md)
