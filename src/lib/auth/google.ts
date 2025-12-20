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
 * 구글 OAuth 2.0 구현
 * @see https://developers.google.com/identity/protocols/oauth2/web-server
 */
export class GoogleOAuthProvider implements OAuthProvider {
  name = 'google';

  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID || '';
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    this.redirectUri = process.env.GOOGLE_REDIRECT_URI || '';

    const missingVars: string[] = [];
    if (!this.clientId) missingVars.push('GOOGLE_CLIENT_ID');
    if (!this.clientSecret) missingVars.push('GOOGLE_CLIENT_SECRET');
    if (!this.redirectUri) missingVars.push('GOOGLE_REDIRECT_URI');

    if (missingVars.length > 0) {
      throw new MissingConfigError(missingVars, 'Google');
    }
  }

  /**
   * 구글 인증 URL 생성
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'openid profile email',
      state,
      access_type: 'offline',
      prompt: 'consent',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * 인가 코드로 액세스 토큰 받기
   */
  async getAccessToken(code: string): Promise<TokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code,
      redirect_uri: this.redirectUri,
    });

    try {
      const response = await fetchWithRetry(
        'https://oauth2.googleapis.com/token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params,
        },
        3,
        10000
      );

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          throw new TokenRequestError('Google', response.statusText);
        }

        throw new TokenRequestError(
          'Google',
          errorData.error || 'unknown',
          errorData.error_description
        );
      }

      const data = await response.json();

      if (!data.access_token) {
        throw new TokenRequestError(
          'Google',
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
        throw new TimeoutError('Google');
      }

      logError(error as Error, {
        provider: 'google',
        method: 'getAccessToken',
      });

      throw new NetworkError(
        (error as Error).message,
        'Google',
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
        'https://www.googleapis.com/oauth2/v1/userinfo?alt=json',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
        3,
        10000
      );

      if (!response.ok) {
        throw new UserInfoError('Google', response.status, {
          statusText: response.statusText,
        });
      }

      const data = await response.json();

      if (!data.id) {
        throw new UserInfoError('Google', 200, {
          error: 'Invalid response',
          details: 'User ID not found in response',
        });
      }

      return {
        id: data.id,
        email: data.email,
        name: data.name,
        profileImage: data.picture,
        provider: 'google',
      };
    } catch (error) {
      if (error instanceof UserInfoError) {
        throw error;
      }

      if ((error as Error).message.includes('timeout')) {
        throw new TimeoutError('Google');
      }

      logError(error as Error, {
        provider: 'google',
        method: 'getUserInfo',
      });

      throw new NetworkError(
        (error as Error).message,
        'Google',
        { originalError: error }
      );
    }
  }
}
