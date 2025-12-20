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
 * 카카오 OAuth 2.0 구현
 * @see https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api
 */
export class KakaoOAuthProvider implements OAuthProvider {
  name = 'kakao';

  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.KAKAO_CLIENT_ID || '';
    this.clientSecret = process.env.KAKAO_CLIENT_SECRET || '';
    this.redirectUri = process.env.KAKAO_REDIRECT_URI || '';

    const missingVars: string[] = [];
    if (!this.clientId) missingVars.push('KAKAO_CLIENT_ID');
    if (!this.redirectUri) missingVars.push('KAKAO_REDIRECT_URI');

    if (missingVars.length > 0) {
      throw new MissingConfigError(missingVars, 'Kakao');
    }
  }

  /**
   * 카카오 인증 URL 생성
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      state,
    });

    return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
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
        'https://kauth.kakao.com/oauth/token',
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
          throw new TokenRequestError('Kakao', response.statusText);
        }

        throw new TokenRequestError(
          'Kakao',
          errorData.error || 'unknown',
          errorData.error_description
        );
      }

      const data = await response.json();

      // 응답 검증
      if (!data.access_token) {
        throw new TokenRequestError(
          'Kakao',
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
        throw new TimeoutError('Kakao');
      }

      logError(error as Error, {
        provider: 'kakao',
        method: 'getAccessToken',
      });

      throw new NetworkError(
        (error as Error).message,
        'Kakao',
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
        'https://kapi.kakao.com/v2/user/me',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
        3,
        10000
      );

      if (!response.ok) {
        throw new UserInfoError('Kakao', response.status, {
          statusText: response.statusText,
        });
      }

      const data = await response.json();

      // 응답 검증
      if (!data.id) {
        throw new UserInfoError('Kakao', 200, {
          error: 'Invalid response',
          details: 'User ID not found in response',
        });
      }

      return {
        id: data.id.toString(),
        email: data.kakao_account?.email,
        name: data.kakao_account?.profile?.nickname,
        profileImage: data.kakao_account?.profile?.profile_image_url,
        provider: 'kakao',
      };
    } catch (error) {
      if (error instanceof UserInfoError) {
        throw error;
      }

      if ((error as Error).message.includes('timeout')) {
        throw new TimeoutError('Kakao');
      }

      logError(error as Error, {
        provider: 'kakao',
        method: 'getUserInfo',
      });

      throw new NetworkError(
        (error as Error).message,
        'Kakao',
        { originalError: error }
      );
    }
  }
}
