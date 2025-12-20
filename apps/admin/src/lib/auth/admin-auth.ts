import { SignJWT, jwtVerify } from 'jose';
import type { AdminUser, AdminPermission } from '@auction/shared/types';
import type { AdminCredentials, AdminSession } from '@/types/auth';

// 타입 re-export
export type { AdminCredentials, AdminSession };

// 백엔드와 동일한 시크릿 키 사용
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET_KEY || 'your-secret-key-change-in-production'
);

// 테스트용 관리자 계정 (실제 환경에서는 DB에서 조회)
const TEST_ADMINS: Record<string, { password: string; user: AdminUser }> = {
  admin1: {
    password: '1234',
    user: {
      id: 1,
      email: 'admin1@auction.com',
      name: '관리자1',
      role: 'super_admin',
      permissions: [
        'products:read', 'products:write', 'products:delete',
        'users:read', 'users:write', 'users:delete',
        'payments:read', 'payments:write',
        'points:read', 'points:write',
        'visitors:read',
        'banners:read', 'banners:write', 'banners:delete',
      ],
      provider: 'email',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  admin2: {
    password: '1234',
    user: {
      id: 2,
      email: 'admin2@auction.com',
      name: '관리자2',
      role: 'admin',
      permissions: [
        'products:read', 'products:write',
        'users:read',
        'payments:read',
        'points:read',
        'visitors:read',
        'banners:read', 'banners:write',
      ],
      provider: 'email',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
};

// JWT 토큰 생성 (백엔드 호환)
export async function createAdminToken(user: AdminUser): Promise<string> {
  return new SignJWT({
    sub: String(user.id),  // 백엔드에서 sub 필드로 user_id 확인 (string으로 변환)
    email: user.email,
    name: user.name,
    role: user.role,
    permissions: user.permissions,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(JWT_SECRET);
}

// JWT 토큰 검증
export async function verifyAdminToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    return {
      user: {
        id: Number(payload.sub),  // sub 필드를 number로 변환
        email: payload.email as string,
        name: payload.name as string,
        role: payload.role as 'admin' | 'super_admin',
        permissions: payload.permissions as AdminPermission[],
        provider: 'email',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      expiresAt: new Date(payload.exp! * 1000),
    };
  } catch {
    return null;
  }
}

// ID/PW 인증 (테스트용 - 실제로는 DB 연동 필요)
export async function authenticateAdmin(
  credentials: AdminCredentials
): Promise<AdminUser | null> {
  const adminData = TEST_ADMINS[credentials.username];

  if (!adminData) {
    return null;
  }

  // 비밀번호 확인 (테스트용 평문 비교, 실제로는 bcrypt 사용)
  if (credentials.password !== adminData.password) {
    return null;
  }

  return adminData.user;
}

// 권한 확인 유틸리티
export function hasPermission(
  user: AdminUser,
  permission: AdminPermission
): boolean {
  return user.permissions.includes(permission);
}

export function hasAnyPermission(
  user: AdminUser,
  permissions: AdminPermission[]
): boolean {
  return permissions.some((p) => user.permissions.includes(p));
}
