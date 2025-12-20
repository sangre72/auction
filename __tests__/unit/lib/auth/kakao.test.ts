// 환경 변수 설정 (import 전에 실행되어야 함)
process.env.KAKAO_CLIENT_ID = 'test-kakao-client-id';
process.env.KAKAO_CLIENT_SECRET = 'test-kakao-client-secret';
process.env.KAKAO_REDIRECT_URI = 'http://localhost:3000/api/auth/callback?provider=kakao';

import { KakaoOAuthProvider } from '@/lib/auth/kakao';
import { TokenRequestError, UserInfoError, MissingConfigError, OAuthError } from '@/lib/auth/errors';

describe('KakaoOAuthProvider', () => {
  let provider: KakaoOAuthProvider;

  beforeEach(() => {
    provider = new KakaoOAuthProvider();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('환경 변수가 없으면 에러 발생', () => {
      const originalClientId = process.env.KAKAO_CLIENT_ID;
      delete process.env.KAKAO_CLIENT_ID;

      expect(() => new KakaoOAuthProvider()).toThrow(OAuthError);
      expect(() => new KakaoOAuthProvider()).toThrow(/KAKAO_CLIENT_ID/);

      process.env.KAKAO_CLIENT_ID = originalClientId;
    });
  });

  describe('getAuthorizationUrl', () => {
    it('올바른 카카오 인증 URL을 생성한다', () => {
      const state = 'test-state-123';
      const url = provider.getAuthorizationUrl(state);

      expect(url).toContain('https://kauth.kakao.com/oauth/authorize');
      expect(url).toContain('client_id=test-kakao-client-id');
      expect(url).toContain('response_type=code');
      expect(url).toContain(`state=${state}`);
      expect(url).toContain('redirect_uri=');
    });

    it('state 파라미터가 URL에 포함된다', () => {
      const state = 'my-unique-state';
      const url = provider.getAuthorizationUrl(state);

      const urlObj = new URL(url);
      expect(urlObj.searchParams.get('state')).toBe(state);
    });
  });

  describe('getAccessToken', () => {
    it('성공적으로 토큰을 받아온다', async () => {
      const mockResponse = {
        access_token: 'test-access-token',
        token_type: 'bearer',
        refresh_token: 'test-refresh-token',
        expires_in: 3600,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await provider.getAccessToken('test-auth-code');

      expect(result.access_token).toBe('test-access-token');
      expect(result.token_type).toBe('bearer');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://kauth.kakao.com/oauth/token',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
      );
    });

    it('토큰 요청 실패 시 에러 발생', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
        json: async () => ({
          error: 'invalid_grant',
          error_description: 'authorization code not found',
        }),
      });

      await expect(provider.getAccessToken('invalid-code')).rejects.toThrow();
    });

    it('access_token이 없는 응답은 에러 발생', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token_type: 'bearer' }),
      });

      await expect(provider.getAccessToken('test-code')).rejects.toThrow();
    });
  });

  describe('getUserInfo', () => {
    it('성공적으로 사용자 정보를 받아온다', async () => {
      const mockUserResponse = {
        id: 12345678,
        kakao_account: {
          email: 'test@example.com',
          profile: {
            nickname: 'TestUser',
            profile_image_url: 'https://example.com/profile.jpg',
          },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserResponse,
      });

      const result = await provider.getUserInfo('test-access-token');

      expect(result.id).toBe('12345678');
      expect(result.email).toBe('test@example.com');
      expect(result.name).toBe('TestUser');
      expect(result.provider).toBe('kakao');
    });

    it('사용자 ID가 없으면 에러 발생', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ kakao_account: {} }),
      });

      await expect(provider.getUserInfo('test-token')).rejects.toThrow();
    });

    it('API 에러 응답 시 에러 발생', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      });

      await expect(provider.getUserInfo('invalid-token')).rejects.toThrow();
    });
  });
});
