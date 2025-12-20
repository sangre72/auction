import type { OAuthProvider, TokenResponse, UserInfo } from './index';
import {
  MissingConfigError,
  NetworkError,
  TimeoutError,
  TokenRequestError,
  UserInfoError,
  logError,
  fetchWithRetry,
} from './errors';

/**
 * 네이버 OAuth 2.0 구현
 * @see https://developers.naver.com/docs/login/api/api.md
 */
export class NaverOAuthProvider implements OAuthProvider {
  name = 'naver';

  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.NAVER_CLIENT_ID || '';
    this.clientSecret = process.env.NAVER_CLIENT_SECRET || '';
    this.redirectUri = process.env.NAVER_REDIRECT_URI || '';

    const missingVars: string[] = [];
    if (!this.clientId) missingVars.push('NAVER_CLIENT_ID');
    if (!this.clientSecret) missingVars.push('NAVER_CLIENT_SECRET');
    if (!this.redirectUri) missingVars.push('NAVER_REDIRECT_URI');

    if (missingVars.length > 0) {
      throw new MissingConfigError(missingVars, 'Naver');
    }
  }

  /**
   * 네이버 인증 URL 생성
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      state,
    });

    return `https://nid.naver.com/oauth2.0/authorize?${params.toString()}`;
  }

  /**
   * 인가 코드로 액세스 토큰 받기
   */
  async getAccessToken(code: string, state: string): Promise<TokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code,
      state,
    });

    try {
      const response = await fetchWithRetry(
        `https://nid.naver.com/oauth2.0/token?${params.toString()}`,
        {},
        3,
        10000
      );

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          throw new TokenRequestError('Naver', response.statusText);
        }

        throw new TokenRequestError(
          'Naver',
          errorData.error || 'unknown',
          errorData.error_description
        );
      }

      const data = await response.json();

      if (!data.access_token) {
        throw new TokenRequestError(
          'Naver',
          'invalid_response',
          'Access token not found in response'
        );
      }

      return data;
    } catch (error) {
      if (error instanceof TokenRequestError) {
        throw error;
      }

      if ((error as Error).message.includes('timeout')) {
        throw new TimeoutError('Naver');
      }

      logError(error as Error, {
        provider: 'naver',
        method: 'getAccessToken',
      });

      throw new NetworkError(
        (error as Error).message,
        'Naver',
        { originalError: error }
      );
    }
  }

  /**
   * 액세스 토큰으로 사용자 정보 받기
   */
  async getUserInfo(accessToken: string): Promise<UserInfo> {
    try {
      const response = await fetchWithRetry(
        'https://openapi.naver.com/v1/nid/me',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
        3,
        10000
      );

      if (!response.ok) {
        throw new UserInfoError('Naver', response.status, {
          statusText: response.statusText,
        });
      }

      const data = await response.json();

      if (data.resultcode !== '00') {
        throw new UserInfoError('Naver', 200, {
          error: data.resultcode,
          message: data.message,
        });
      }

      const profile = data.response;

      if (!profile || !profile.id) {
        throw new UserInfoError('Naver', 200, {
          error: 'Invalid response',
          details: 'User ID not found in response',
        });
      }

      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        profileImage: profile.profile_image,
        provider: 'naver',
      };
    } catch (error) {
      if (error instanceof UserInfoError) {
        throw error;
      }

      if ((error as Error).message.includes('timeout')) {
        throw new TimeoutError('Naver');
      }

      logError(error as Error, {
        provider: 'naver',
        method: 'getUserInfo',
      });

      throw new NetworkError(
        (error as Error).message,
        'Naver',
        { originalError: error }
      );
    }
  }
}
