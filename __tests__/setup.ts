/**
 * Jest 테스트 설정
 */

// 환경 변수 Mock
process.env.KAKAO_CLIENT_ID = 'test-kakao-client-id';
process.env.KAKAO_CLIENT_SECRET = 'test-kakao-client-secret';
process.env.KAKAO_REDIRECT_URI = 'http://localhost:3000/api/auth/callback?provider=kakao';

process.env.NAVER_CLIENT_ID = 'test-naver-client-id';
process.env.NAVER_CLIENT_SECRET = 'test-naver-client-secret';
process.env.NAVER_REDIRECT_URI = 'http://localhost:3000/api/auth/callback?provider=naver';

process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';
process.env.GOOGLE_REDIRECT_URI = 'http://localhost:3000/api/auth/callback?provider=google';

// Global fetch Mock
global.fetch = jest.fn() as jest.Mock;
