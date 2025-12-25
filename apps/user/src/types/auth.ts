/**
 * 사용자 인증 관련 타입 (User App 전용)
 *
 * @auction/shared의 BaseUser를 확장하여 사용
 */

import type { BaseUser, AuthState as BaseAuthState, UseAuthReturn as BaseUseAuthReturn } from '@auction/shared';

/**
 * User App 전용 사용자 프로필
 * BaseUser를 확장하여 앱 전용 필드 추가
 */
export interface UserProfile extends BaseUser {
  id: number;
  email: string;
  name: string;
  nickname?: string;
  profile_image?: string;
}

/**
 * User App 전용 인증 상태
 */
export type AuthState = BaseAuthState<UserProfile>;

/**
 * User App 전용 useAuth 반환 타입
 */
export type UseAuthReturn = BaseUseAuthReturn<UserProfile>;
