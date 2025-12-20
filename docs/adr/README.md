# Architecture Decision Records (ADR)

이 디렉토리는 프로젝트의 주요 아키텍처 결정사항을 문서화합니다.

## ADR이란?

Architecture Decision Record (ADR)는 소프트웨어 개발 과정에서 내린 중요한 아키텍처 결정을 문서화하는 방법입니다.

### ADR의 목적

- **투명성**: 왜 특정 결정을 내렸는지 설명
- **컨텍스트**: 결정 당시의 상황과 제약사항 기록
- **추적성**: 시간이 지나도 결정의 이유를 이해 가능
- **학습**: 팀원과 미래의 개발자를 위한 지식 전달

## ADR 작성 시기

다음과 같은 경우 ADR을 작성합니다:

- 새로운 기술 스택 선택
- 아키텍처 패턴 변경
- 주요 라이브러리 선택
- 설계 원칙 변경
- 성능/보안 트레이드오프 결정

## ADR 형식

각 ADR은 다음 형식을 따릅니다:

```markdown
# ADR-XXXX: [제목]

## 상태
[제안됨 | 승인됨 | 거부됨 | 폐기됨 | 대체됨]

## 컨텍스트
[결정이 필요한 상황과 배경 설명]

## 결정
[내린 결정 내용]

## 근거
[해당 결정을 내린 이유]

## 대안
[고려했던 다른 옵션들]

## 결과
[이 결정으로 인한 긍정적/부정적 영향]

## 관련 문서
[관련 ADR, 이슈, PR 등]
```

## 기존 ADR 목록

- [ADR-0001: TypeScript와 Next.js App Router 선택](./0001-typescript-and-nextjs.md)
- [ADR-0002: OAuth Provider 인터페이스 설계](./0002-oauth-provider-interface.md)
- [ADR-0003: 에러 처리 전략](./0003-error-handling-strategy.md)
- [ADR-0004: 타임아웃 및 재시도 메커니즘](./0004-timeout-and-retry.md)

## 새 ADR 생성하기

```bash
./new-adr.sh "제목"
```

또는 수동으로:

1. `docs/adr/XXXX-title.md` 파일 생성
2. 템플릿 복사 (`template.md`)
3. 내용 작성
4. 이 README에 링크 추가
