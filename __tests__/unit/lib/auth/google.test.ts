// 환경 변수 설정 (import 전에 실행되어야 함)
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-google-client-secret';
process.env.GOOGLE_REDIRECT_URI = 'http://localhost:3000/api/auth/callback?provider=google';

import { GoogleOAuthProvider } from '@/lib/auth/google';
import { TokenRequestError, UserInfoError, OAuthError } from '@/lib/auth/errors';

describe('GoogleOAuthProvider', () => {
  let provider: GoogleOAuthProvider;

  beforeEach(() => {
    provider = new GoogleOAuthProvider();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('환경 변수가 없으면 에러 발생', () => {
      const originalClientId = process.env.GOOGLE_CLIENT_ID;
      delete process.env.GOOGLE_CLIENT_ID;

      expect(() => new GoogleOAuthProvider()).toThrow(OAuthError);
      expect(() => new GoogleOAuthProvider()).toThrow(/GOOGLE_CLIENT_ID/);

      process.env.GOOGLE_CLIENT_ID = originalClientId;
    });
  });

  describe('getAuthorizationUrl', () => {
    it('올바른 구글 인증 URL을 생성한다', () => {
      const state = 'test-state-123';
      const url = provider.getAuthorizationUrl(state);

      expect(url).toContain('https://accounts.google.com/o/oauth2/v2/auth');
      expect(url).toContain('client_id=test-google-client-id');
      expect(url).toContain('response_type=code');
      expect(url).toContain(`state=${state}`);
      expect(url).toContain('scope=openid+profile+email');
    });

    it('access_type과 prompt 파라미터가 포함된다', () => {
      const state = 'test-state';
      const url = provider.getAuthorizationUrl(state);

      expect(url).toContain('access_type=offline');
      expect(url).toContain('prompt=consent');
    });
  });

  describe('getAccessToken', () => {
    it('성공적으로 토큰을 받아온다', async () => {
      const mockResponse = {
        access_token: 'test-google-access-token',
        token_type: 'Bearer',
        refresh_token: 'test-refresh-token',
        expires_in: 3600,
        id_token: 'test-id-token',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await provider.getAccessToken('test-auth-code');

      expect(result.access_token).toBe('test-google-access-token');
      expect(result.token_type).toBe('Bearer');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://oauth2.googleapis.com/token',
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
          error_description: 'Code was already redeemed',
        }),
      });

      await expect(provider.getAccessToken('used-code')).rejects.toThrow();
    });

    it('access_token이 없는 응답은 에러 발생', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token_type: 'Bearer' }),
      });

      await expect(provider.getAccessToken('test-code')).rejects.toThrow();
    });
  });

  describe('getUserInfo', () => {
    it('성공적으로 사용자 정보를 받아온다', async () => {
      const mockUserResponse = {
        id: 'google-user-id-123',
        email: 'test@gmail.com',
        verified_email: true,
        name: 'GoogleUser',
        picture: 'https://example.com/google-profile.jpg',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserResponse,
      });

      const result = await provider.getUserInfo('test-access-token');

      expect(result.id).toBe('google-user-id-123');
      expect(result.email).toBe('test@gmail.com');
      expect(result.name).toBe('GoogleUser');
      expect(result.profileImage).toBe('https://example.com/google-profile.jpg');
      expect(result.provider).toBe('google');
    });

    it('사용자 ID가 없으면 에러 발생', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ email: 'test@gmail.com' }),
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
