# OAuth 제공자 설정 가이드

이 문서는 카카오, 네이버, 구글 OAuth 2.0 설정에 필요한 모든 정보를 담고 있습니다.

## 1. 카카오 OAuth 설정

### API 엔드포인트

| 용도 | URL |
|------|-----|
| 인가 코드 받기 | `https://kauth.kakao.com/oauth/authorize` |
| 토큰 받기 | `https://kauth.kakao.com/oauth/token` |
| 토큰 갱신 | `https://kauth.kakao.com/oauth/token` |
| 사용자 정보 | `https://kapi.kakao.com/v2/user/me` |
| 로그아웃 | `https://kapi.kakao.com/v1/user/logout` |
| 연결 끊기 | `https://kapi.kakao.com/v1/user/unlink` |

### 개발자 콘솔 설정 단계

1. **Kakao Developers 접속**
   - URL: https://developers.kakao.com/
   - 카카오 계정으로 로그인

2. **애플리케이션 생성**
   - 내 애플리케이션 → 애플리케이션 추가하기
   - 앱 이름, 사업자명 입력

3. **앱 키 확인**
   - 앱 설정 → 앱 키
   - REST API 키 복사 (`KAKAO_CLIENT_ID`)
   - Client Secret 생성 및 복사 (`KAKAO_CLIENT_SECRET`)

4. **플랫폼 설정**
   - 앱 설정 → 플랫폼
   - Web 플랫폼 등록
   - 사이트 도메인: `http://localhost:3000` (개발)

5. **Redirect URI 설정**
   - 제품 설정 → 카카오 로그인
   - Redirect URI 등록:
     ```
     http://localhost:3000/api/auth/callback (개발)
     https://yourdomain.com/api/auth/callback (프로덕션)
     ```

6. **동의 항목 설정**
   - 제품 설정 → 카카오 로그인 → 동의 항목
   - 필수 동의 항목 설정:
     - 닉네임 (profile_nickname)
     - 프로필 사진 (profile_image)
     - 이메일 (account_email) - 선택 동의로 설정 권장

7. **비즈니스 인증 (선택)**
   - 이메일 등 민감 정보를 필수로 받으려면 비즈니스 인증 필요

### OAuth 파라미터

**인가 코드 요청**
```
GET https://kauth.kakao.com/oauth/authorize
```

| 파라미터 | 필수 | 설명 |
|---------|------|------|
| client_id | O | REST API 키 |
| redirect_uri | O | 인가 코드를 받을 URI |
| response_type | O | `code`로 고정 |
| state | X | CSRF 방지용 (권장) |
| scope | X | 추가 동의 항목 |
| prompt | X | `login`: 재인증 강제 |

**토큰 요청**
```
POST https://kauth.kakao.com/oauth/token
Content-Type: application/x-www-form-urlencoded
```

| 파라미터 | 필수 | 설명 |
|---------|------|------|
| grant_type | O | `authorization_code` |
| client_id | O | REST API 키 |
| client_secret | X | 보안 강화 시 사용 |
| code | O | 인가 코드 |
| redirect_uri | O | 인가 코드 받은 URI |

### 응답 예시

**토큰 응답**
```json
{
  "access_token": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "token_type": "bearer",
  "refresh_token": "yyyyyyyyyyyyyyyyyyyyyyyyyyyyyy",
  "expires_in": 21599,
  "scope": "profile_nickname profile_image account_email",
  "refresh_token_expires_in": 5183999
}
```

**사용자 정보 응답**
```json
{
  "id": 123456789,
  "connected_at": "2024-01-01T00:00:00Z",
  "kakao_account": {
    "profile_nickname_needs_agreement": false,
    "profile_image_needs_agreement": false,
    "profile": {
      "nickname": "홍길동",
      "thumbnail_image_url": "http://...",
      "profile_image_url": "http://..."
    },
    "has_email": true,
    "email_needs_agreement": false,
    "is_email_valid": true,
    "is_email_verified": true,
    "email": "user@example.com"
  }
}
```

---

## 2. 네이버 OAuth 설정

### API 엔드포인트

| 용도 | URL |
|------|-----|
| 인가 코드 받기 | `https://nid.naver.com/oauth2.0/authorize` |
| 토큰 받기 | `https://nid.naver.com/oauth2.0/token` |
| 토큰 갱신 | `https://nid.naver.com/oauth2.0/token` |
| 토큰 삭제 | `https://nid.naver.com/oauth2.0/token` |
| 사용자 정보 | `https://openapi.naver.com/v1/nid/me` |

### 개발자 콘솔 설정 단계

1. **Naver Developers 접속**
   - URL: https://developers.naver.com/
   - 네이버 계정으로 로그인

2. **애플리케이션 등록**
   - Application → 애플리케이션 등록
   - 애플리케이션 이름 입력

3. **사용 API 선택**
   - 네이버 로그인 선택
   - 필요한 정보 항목 선택:
     - 회원이름
     - 이메일 주소 (필수)
     - 프로필 사진
     - 생일
     - 연령대

4. **제공 정보 선택**
   - 필수: 이메일 주소
   - 선택: 닉네임, 프로필 사진 등

5. **서비스 환경 등록**
   - 서비스 URL: `http://localhost:3000` (개발)
   - Callback URL:
     ```
     http://localhost:3000/api/auth/callback (개발)
     https://yourdomain.com/api/auth/callback (프로덕션)
     ```

6. **Client ID/Secret 확인**
   - Client ID 복사 (`NAVER_CLIENT_ID`)
   - Client Secret 복사 (`NAVER_CLIENT_SECRET`)

### OAuth 파라미터

**인가 코드 요청**
```
GET https://nid.naver.com/oauth2.0/authorize
```

| 파라미터 | 필수 | 설명 |
|---------|------|------|
| client_id | O | 애플리케이션 등록 시 발급받은 Client ID |
| redirect_uri | O | 콜백 URL (URL 인코딩) |
| response_type | O | `code`로 고정 |
| state | O | CSRF 방지 (필수!) |

**토큰 요청**
```
GET/POST https://nid.naver.com/oauth2.0/token
```

| 파라미터 | 필수 | 설명 |
|---------|------|------|
| grant_type | O | `authorization_code` |
| client_id | O | Client ID |
| client_secret | O | Client Secret |
| code | O | 인가 코드 |
| state | O | 인가 코드 요청 시 전달한 state |

### 응답 예시

**토큰 응답**
```json
{
  "access_token": "AAAAQosjWDJieBiQZc3to9YQp6HDLvrmyKC+6+iZ3gq7qrkqf50ljZC+Lgoqrg",
  "refresh_token": "c8ceMEJisO4Se7uGisHoX0f5JEii7JnipglQipkOn5Zp3tyP7dHQoP0zNKHUq2gY",
  "token_type": "bearer",
  "expires_in": 3600
}
```

**사용자 정보 응답**
```json
{
  "resultcode": "00",
  "message": "success",
  "response": {
    "id": "32742776",
    "nickname": "OpenAPI",
    "name": "홍길동",
    "email": "user@naver.com",
    "gender": "M",
    "age": "30-39",
    "birthday": "12-25",
    "profile_image": "https://...",
    "birthyear": "1990",
    "mobile": "010-1234-5678"
  }
}
```

---

## 3. 구글 OAuth 설정

### API 엔드포인트

| 용도 | URL |
|------|-----|
| 인가 코드 받기 | `https://accounts.google.com/o/oauth2/v2/auth` |
| 토큰 받기 | `https://oauth2.googleapis.com/token` |
| 토큰 갱신 | `https://oauth2.googleapis.com/token` |
| 토큰 폐기 | `https://oauth2.googleapis.com/revoke` |
| 사용자 정보 | `https://www.googleapis.com/oauth2/v1/userinfo` |
| OpenID 정보 | `https://openidconnect.googleapis.com/v1/userinfo` |

### 개발자 콘솔 설정 단계

1. **Google Cloud Console 접속**
   - URL: https://console.cloud.google.com/
   - 구글 계정으로 로그인

2. **프로젝트 생성**
   - 프로젝트 선택 → 새 프로젝트
   - 프로젝트 이름 입력

3. **OAuth 동의 화면 구성**
   - API 및 서비스 → OAuth 동의 화면
   - 사용자 유형 선택:
     - 외부: 누구나 사용 가능
     - 내부: Google Workspace 조직 내부만
   - 앱 정보 입력:
     - 앱 이름
     - 사용자 지원 이메일
     - 승인된 도메인
     - 개발자 연락처 정보

4. **범위 추가**
   - 범위 추가 또는 삭제
   - 권장 범위:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `openid`

5. **OAuth 2.0 클라이언트 ID 생성**
   - API 및 서비스 → 사용자 인증 정보
   - 사용자 인증 정보 만들기 → OAuth 클라이언트 ID
   - 애플리케이션 유형: 웹 애플리케이션
   - 이름 입력

6. **승인된 리디렉션 URI 추가**
   ```
   http://localhost:3000/api/auth/callback (개발)
   https://yourdomain.com/api/auth/callback (프로덕션)
   ```

7. **Client ID/Secret 저장**
   - Client ID 복사 (`GOOGLE_CLIENT_ID`)
   - Client Secret 복사 (`GOOGLE_CLIENT_SECRET`)

### OAuth 파라미터

**인가 코드 요청**
```
GET https://accounts.google.com/o/oauth2/v2/auth
```

| 파라미터 | 필수 | 설명 |
|---------|------|------|
| client_id | O | OAuth 2.0 클라이언트 ID |
| redirect_uri | O | 승인된 리디렉션 URI |
| response_type | O | `code`로 고정 |
| scope | O | 공백으로 구분된 범위 목록 |
| state | X | CSRF 방지용 (권장) |
| access_type | X | `offline`: refresh token 받기 |
| prompt | X | `consent`: 재동의, `select_account`: 계정 선택 |
| include_granted_scopes | X | `true`: 증분 승인 |

**토큰 요청**
```
POST https://oauth2.googleapis.com/token
Content-Type: application/x-www-form-urlencoded
```

| 파라미터 | 필수 | 설명 |
|---------|------|------|
| grant_type | O | `authorization_code` |
| client_id | O | OAuth 2.0 클라이언트 ID |
| client_secret | O | OAuth 2.0 클라이언트 Secret |
| code | O | 인가 코드 |
| redirect_uri | O | 인가 코드 받은 URI |

### 응답 예시

**토큰 응답**
```json
{
  "access_token": "ya29.a0AfH6SMBx...",
  "expires_in": 3599,
  "refresh_token": "1//0gZ...",
  "scope": "openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
  "token_type": "Bearer",
  "id_token": "eyJhbGciOiJSUzI1NiIs..."
}
```

**사용자 정보 응답**
```json
{
  "id": "1234567890",
  "email": "user@gmail.com",
  "verified_email": true,
  "name": "Hong Gildong",
  "given_name": "Gildong",
  "family_name": "Hong",
  "picture": "https://lh3.googleusercontent.com/...",
  "locale": "ko"
}
```

---

## 4. N8N 웹훅 통합

### N8N 워크플로우 설정

N8N에서 OAuth 콜백 이벤트를 받아 처리하는 워크플로우를 구성할 수 있습니다.

### 웹훅 엔드포인트 예시

```
POST https://your-n8n-instance.com/webhook/oauth-callback
```

### 페이로드 구조

```json
{
  "event": "user_login",
  "provider": "kakao|naver|google",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "profileImage": "https://...",
    "provider": "kakao"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### N8N 노드 구성 예시

1. **Webhook 노드**: OAuth 콜백 이벤트 수신
2. **Function 노드**: 사용자 데이터 변환
3. **HTTP Request 노드**: CRM에 사용자 정보 전송
4. **Slack 노드**: 신규 가입 알림
5. **Google Sheets 노드**: 사용자 목록 업데이트

---

## 5. 보안 체크리스트

### 필수 보안 조치

- [ ] Client Secret은 환경 변수로 관리
- [ ] HTTPS 사용 (프로덕션)
- [ ] State 파라미터로 CSRF 방지
- [ ] 토큰은 httpOnly 쿠키 또는 암호화된 DB에 저장
- [ ] Access Token은 클라이언트에 노출하지 않기
- [ ] Refresh Token으로 토큰 갱신 구현
- [ ] Rate limiting 적용
- [ ] 로그에 민감 정보 기록하지 않기

### 권장 보안 조치

- [ ] PKCE (Proof Key for Code Exchange) 사용
- [ ] Token Rotation 구현
- [ ] IP 화이트리스트 설정 (가능한 경우)
- [ ] 로그인 시도 횟수 제한
- [ ] 의심스러운 활동 모니터링
- [ ] 정기적인 보안 감사

---

## 6. 문제 해결

### 공통 오류

**"redirect_uri_mismatch"**
- 원인: Redirect URI 불일치
- 해결: 개발자 콘솔에 등록한 URI와 코드의 URI를 정확히 일치시키기
- 팁: 프로토콜(http/https), 포트, 경로까지 완전히 동일해야 함

**"invalid_client"**
- 원인: Client ID 또는 Secret 오류
- 해결: 환경 변수 확인, Client Secret 재생성

**"invalid_grant"**
- 원인: 인가 코드 만료 또는 이미 사용됨
- 해결: 인가 코드는 1회만 사용 가능, 새로운 인가 코드 요청

**"access_denied"**
- 원인: 사용자가 권한 거부
- 해결: 사용자에게 명확한 권한 요청 이유 설명

### 디버깅 팁

1. **네트워크 탭 확인**: 브라우저 개발자 도구에서 요청/응답 확인
2. **로그 출력**: 토큰 요청/응답 로그 (민감 정보 제외)
3. **Postman 테스트**: API를 직접 호출하여 테스트
4. **공식 문서 참조**: 각 제공자의 최신 문서 확인

---

## 7. 참고 자료

### 카카오
- [카카오 로그인 공식 문서](https://developers.kakao.com/docs/latest/ko/kakaologin/common)
- [REST API 레퍼런스](https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api)

### 네이버
- [네이버 로그인 API 명세](https://developers.naver.com/docs/login/api/api.md)
- [개발 가이드](https://developers.naver.com/docs/login/devguide/devguide.md)

### 구글
- [Google Identity Platform](https://developers.google.com/identity)
- [OAuth 2.0 for Web Server Applications](https://developers.google.com/identity/protocols/oauth2/web-server)
- [OpenID Connect](https://developers.google.com/identity/protocols/oauth2/openid-connect)

### OAuth 2.0
- [RFC 6749 - The OAuth 2.0 Authorization Framework](https://datatracker.ietf.org/doc/html/rfc6749)
- [RFC 7636 - PKCE](https://datatracker.ietf.org/doc/html/rfc7636)
