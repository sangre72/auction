---
name: git-smart-push
description: Git push를 실행하기 전에 dev 브랜치와 현재 브랜치를 pull하고 merge하여 충돌을 방지합니다. 실행 전 사용자 확인을 받습니다.
---

# Git Smart Push 스킬 실행 지침

사용자가 `/push` 명령어를 실행하거나 "git push해줘"라고 요청하면 다음 단계를 수행합니다.

## 실행 단계

### 1단계: 현재 Git 상태 확인

먼저 다음 정보를 수집합니다:

```bash
# 현재 브랜치 확인
git branch --show-current

# Git 상태 확인
git status

# 커밋되지 않은 변경사항 확인
git status --porcelain

# 모든 브랜치 확인 (dev 존재 여부)
git branch -a
```

**중요**:
- 커밋되지 않은 변경사항이 있으면 사용자에게 알리고, 커밋하거나 stash할 것을 제안합니다
- main/master 브랜치에서 실행 시 경고 메시지를 표시합니다

### 2단계: 사용자에게 실행 계획 확인

`AskUserQuestion` 툴을 사용하여 다음 질문들을 합니다:

**질문 구성**:

1. **dev 브랜치가 로컬 또는 원격에 존재하는 경우**:
   - 질문: "dev 브랜치를 pull하고 현재 브랜치에 merge하시겠습니까?"
   - Header: "dev merge"
   - 옵션:
     - "예, dev를 merge합니다 (권장)" - dev 브랜치의 최신 변경사항을 현재 브랜치에 통합
     - "아니오, dev를 건너뜁니다" - dev 브랜치 처리 생략

2. **현재 브랜치 pull 여부**:
   - 질문: "현재 브랜치({브랜치명})를 pull하시겠습니까?"
   - Header: "브랜치 pull"
   - 옵션:
     - "예, pull합니다 (권장)" - 원격의 최신 변경사항을 가져옴
     - "아니오, 건너뜁니다" - pull 생략

3. **Push 실행 확인**:
   - 질문: "모든 준비가 완료되었습니다. {브랜치명}을 push하시겠습니까?"
   - Header: "push 실행"
   - 옵션:
     - "예, push합니다" - push 실행
     - "아니오, 취소합니다" - 전체 작업 취소

### 3단계: Dev 브랜치 처리 (사용자가 "예"를 선택한 경우)

dev 브랜치가 존재하고 사용자가 merge를 선택한 경우:

```bash
# 1. 현재 브랜치 저장
CURRENT_BRANCH=$(git branch --show-current)

# 2. 원격 정보 가져오기
git fetch origin

# 3. dev 브랜치가 로컬에 있는지 확인
if git show-ref --verify --quiet refs/heads/dev; then
  # 로컬 dev가 있는 경우
  git checkout dev
  git pull origin dev
else
  # 로컬 dev가 없는 경우 (원격에만 있음)
  git checkout -b dev origin/dev
  git pull origin dev
fi

# 4. 원래 브랜치로 돌아가기
git checkout $CURRENT_BRANCH

# 5. dev를 현재 브랜치에 merge
git merge dev
```

**충돌 처리**:
- Merge 중 충돌이 발생하면:
  1. 충돌 파일 목록 표시: `git diff --name-only --diff-filter=U`
  2. 사용자에게 충돌을 해결하도록 안내
  3. 스킬 실행 중단
  4. 사용자가 수동으로 충돌 해결 후 다시 `/push` 실행하도록 안내

### 4단계: 현재 브랜치 Pull (사용자가 "예"를 선택한 경우)

```bash
# 현재 브랜치 pull
git pull origin <현재-브랜치명>
```

**충돌 처리**:
- Pull 중 충돌이 발생하면 3단계와 동일하게 처리

### 5단계: Push 실행 (사용자가 "예"를 선택한 경우)

```bash
# Push 실행
git push origin <현재-브랜치명>
```

**실패 처리**:
- Push 실패 시 에러 메시지 표시
- 일반적인 원인과 해결 방법 안내

### 6단계: 완료 메시지

성공적으로 완료되면:
```
✅ Push 완료!

작업 요약:
- dev 브랜치 merge: {예/아니오}
- 현재 브랜치 pull: {예/아니오}
- Push 브랜치: {브랜치명}
- 최종 커밋: {커밋 해시}

원격 리포지토리가 업데이트되었습니다.
```

실패 시 명확한 에러 메시지와 다음 단계 안내를 제공합니다.

## 특수 상황 처리

### 커밋되지 않은 변경사항이 있는 경우

```
⚠️ 커밋되지 않은 변경사항이 있습니다.

다음 파일들이 수정되었습니다:
{파일 목록}

옵션을 선택하세요:
```

`AskUserQuestion`로 물어보기:
- "변경사항을 커밋하고 계속" - 커밋 프로세스 실행
- "Stash에 저장하고 계속" - git stash 실행
- "취소" - 스킬 종료

### main/master 브랜치에서 실행 시

```
⚠️ 경고: 현재 {main/master} 브랜치에 있습니다.
직접 push하는 것은 권장되지 않습니다.

계속하시겠습니까?
```

사용자 확인 후 진행 또는 취소

### dev 브랜치가 없는 경우

dev 브랜치 관련 질문을 건너뛰고 바로 현재 브랜치 pull/push로 진행

## 에러 메시지 가이드

### Merge 충돌
```
❌ Merge 충돌이 발생했습니다.

충돌 파일:
{파일 목록}

해결 방법:
1. 충돌 파일을 열어서 수동으로 해결
2. git add <파일명>으로 해결된 파일 추가
3. git commit으로 merge 커밋 완료
4. 다시 /push 실행

현재 작업을 중단합니다.
```

### Push 실패
```
❌ Push가 실패했습니다.

원인: {에러 메시지}

일반적인 해결 방법:
- 원격에 새로운 커밋이 있는 경우: git pull 먼저 실행
- 권한 문제: GitHub 인증 확인
- 브랜치 보호 규칙: PR을 통해 머지 필요

다시 시도하려면 /push를 실행하세요.
```

## 사용 예시

### 예시 1: 정상적인 실행
```
User: /push