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
 * {{PROVIDER_NAME}} OAuth 2.0 구현
 * @see {{DOCUMENTATION_URL}}
 */
export class {{PROVIDER_CLASS_NAME}} implements OAuthProvider {
  name = '{{PROVIDER_ID}}';

  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.{{PROVIDER_ENV_PREFIX}}_CLIENT_ID || '';
    this.clientSecret = process.env.{{PROVIDER_ENV_PREFIX}}_CLIENT_SECRET || '';
    this.redirectUri = process.env.{{PROVIDER_ENV_PREFIX}}_REDIRECT_URI || '';

    const missingVars: string[] = [];
    if (!this.clientId) missingVars.push('{{PROVIDER_ENV_PREFIX}}_CLIENT_ID');
    if (!this.clientSecret) missingVars.push('{{PROVIDER_ENV_PREFIX}}_CLIENT_SECRET');
    if (!this.redirectUri) missingVars.push('{{PROVIDER_ENV_PREFIX}}_REDIRECT_URI');

    if (missingVars.length > 0) {
      throw new MissingConfigError(missingVars, '{{PROVIDER_NAME}}');
    }
  }

  /**
   * {{PROVIDER_NAME}} 인증 URL 생성
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: '{{DEFAULT_SCOPE}}',
      state,
      // 추가 파라미터...
    });

    return `{{AUTHORIZATION_URL}}?${params.toString()}`;
  }

  /**
   * 인가 코드로 액세스 토큰 받기
   */
  async getAccessToken(code: string, state?: string): Promise<TokenResponse> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code,
      redirect_uri: this.redirectUri,
      ...(state && { state }),
    });

    try {
      const response = await fetchWithRetry(
        '{{TOKEN_URL}}',
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
          throw new TokenRequestError('{{PROVIDER_NAME}}', response.statusText);
        }

        throw new TokenRequestError(
          '{{PROVIDER_NAME}}',
          errorData.error || 'unknown',
          errorData.error_description
        );
      }

      const data = await response.json();

      // 응답 검증
      if (!data.access_token) {
        throw new TokenRequestError(
          '{{PROVIDER_NAME}}',
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
        throw new TimeoutError('{{PROVIDER_NAME}}');
      }

      logError(error as Error, {
        provider: '{{PROVIDER_ID}}',
        method: 'getAccessToken',
      });

      throw new NetworkError(
        (error as Error).message,
        '{{PROVIDER_NAME}}',
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
        '{{USERINFO_URL}}',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
        3,
        10000
      );

      if (!response.ok) {
        throw new UserInfoError('{{PROVIDER_NAME}}', response.status, {
          statusText: response.statusText,
        });
      }

      const data = await response.json();

      // 응답 검증
      if (!data.{{USER_ID_FIELD}}) {
        throw new UserInfoError('{{PROVIDER_NAME}}', 200, {
          error: 'Invalid response',
          details: 'User ID not found in response',
        });
      }

      return {
        id: String(data.{{USER_ID_FIELD}}),
        email: data.{{EMAIL_FIELD}},
        name: data.{{NAME_FIELD}},
        profileImage: data.{{PROFILE_IMAGE_FIELD}},
        provider: '{{PROVIDER_ID}}',
      };
    } catch (error) {
      if (error instanceof UserInfoError) {
        throw error;
      }

      if ((error as Error).message.includes('timeout')) {
        throw new TimeoutError('{{PROVIDER_NAME}}');
      }

      logError(error as Error, {
        provider: '{{PROVIDER_ID}}',
        method: 'getUserInfo',
      });

      throw new NetworkError(
        (error as Error).message,
        '{{PROVIDER_NAME}}',
        { originalError: error }
      );
    }
  }
}
