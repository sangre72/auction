/**
 * 인증 관련 타입 정의 (Admin App 전용)
 */

import type { AdminUser } from '@auction/shared';

export interface AdminCredentials {
  username: string;
  password: string;
}

export interface AdminSession {
  user: AdminUser;
  expiresAt: Date;
}
