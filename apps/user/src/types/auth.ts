/**
 * 사용자 인증 관련 타입 (User App 전용)
 */

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  nickname?: string;
  profile_image?: string;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface UseAuthReturn extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}
