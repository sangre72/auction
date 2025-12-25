/**
 * 인증 플러그인 타입 정의
 * 어떤 프로젝트에서든 재사용 가능한 제네릭 인증 타입
 */

// ============================================================================
// Generic User Types (프로젝트별로 확장 가능)
// ============================================================================

/**
 * 최소한의 사용자 정보 인터페이스
 * 프로젝트에서 확장하여 사용
 */
export interface BaseUser {
  id: number | string;
  email?: string;
  name?: string;
}

// ============================================================================
// Auth State Types
// ============================================================================

/**
 * 인증 상태 (제네릭)
 * @template TUser - 사용자 타입 (BaseUser 확장)
 */
export interface AuthState<TUser extends BaseUser = BaseUser> {
  user: TUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * useAuth 훅 반환 타입 (제네릭)
 * @template TUser - 사용자 타입
 */
export interface UseAuthReturn<TUser extends BaseUser = BaseUser> extends AuthState<TUser> {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

// ============================================================================
// Auth API Response Types
// ============================================================================

export interface AuthLoginResponse<TUser extends BaseUser = BaseUser> {
  success: boolean;
  data: {
    user: TUser;
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };
}

export interface AuthMeResponse<TUser extends BaseUser = BaseUser> {
  success: boolean;
  data: TUser;
}

export interface AuthRefreshResponse {
  success: boolean;
  data?: {
    access_token: string;
    expires_in?: number;
  };
}

// ============================================================================
// Credential Types
// ============================================================================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name?: string;
  nickname?: string;
  phone?: string;
}
