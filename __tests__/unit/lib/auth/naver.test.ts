// 환경 변수 설정 (import 전에 실행되어야 함)
process.env.NAVER_CLIENT_ID = 'test-naver-client-id';
process.env.NAVER_CLIENT_SECRET = 'test-naver-client-secret';
process.env.NAVER_REDIRECT_URI = 'http://localhost:3000/api/auth/callback?provider=naver';

import { NaverOAuthProvider } from '@/lib/auth/naver';
import { TokenRequestError, UserInfoError, OAuthError } from '@/lib/auth/errors';

describe('NaverOAuthProvider', () => {
  let provider: NaverOAuthProvider;

  beforeEach(() => {
    provider = new NaverOAuthProvider();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('환경 변수가 없으면 에러 발생', () => {
      const originalClientId = process.env.NAVER_CLIENT_ID;
      delete process.env.NAVER_CLIENT_ID;

      expect(() => new NaverOAuthProvider()).toThrow(OAuthError);
      expect(() => new NaverOAuthProvider()).toThrow(/NAVER_CLIENT_ID/);

      process.env.NAVER_CLIENT_ID = originalClientId;
    });
  });

  describe('getAuthorizationUrl', () => {
    it('올바른 네이버 인증 URL을 생성한다', () => {
      const state = 'test-state-123';
      const url = provider.getAuthorizationUrl(state);

      expect(url).toContain('https://nid.naver.com/oauth2.0/authorize');
      expect(url).toContain('client_id=test-naver-client-id');
      expect(url).toContain('response_type=code');
      expect(url).toContain(`state=${state}`);
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
        access_token: 'test-naver-access-token',
        token_type: 'bearer',
        refresh_token: 'test-refresh-token',
        expires_in: 3600,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await provider.getAccessToken('test-auth-code', 'test-state');

      expect(result.access_token).toBe('test-naver-access-token');
      expect(result.token_type).toBe('bearer');
    });

    it('토큰 요청 실패 시 에러 발생', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
        json: async () => ({
          error: 'invalid_request',
          error_description: 'invalid code',
        }),
      });

      await expect(
        provider.getAccessToken('invalid-code', 'state')
      ).rejects.toThrow();
    });
  });

  describe('getUserInfo', () => {
    it('성공적으로 사용자 정보를 받아온다', async () => {
      const mockUserResponse = {
        resultcode: '00',
        message: 'success',
        response: {
          id: 'naver-user-id-123',
          email: 'test@naver.com',
          name: 'NaverUser',
          profile_image: 'https://example.com/naver-profile.jpg',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserResponse,
      });

      const result = await provider.getUserInfo('test-access-token');

      expect(result.id).toBe('naver-user-id-123');
      expect(result.email).toBe('test@naver.com');
      expect(result.name).toBe('NaverUser');
      expect(result.provider).toBe('naver');
    });

    it('resultcode가 00이 아니면 에러 발생', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          resultcode: '024',
          message: 'Authentication failed',
        }),
      });

      await expect(provider.getUserInfo('test-token')).rejects.toThrow();
    });

    it('response에 id가 없으면 에러 발생', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          resultcode: '00',
          message: 'success',
          response: { email: 'test@naver.com' },
        }),
      });

      await expect(provider.getUserInfo('test-token')).rejects.toThrow();
    });
  });
});
