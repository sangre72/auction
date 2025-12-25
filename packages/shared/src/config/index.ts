/**
 * Plugin Architecture - Runtime Configuration
 *
 * 모듈을 100% 재사용 가능하게 만들기 위한 설정 시스템
 * 다른 프로젝트에서 설정만 변경하여 사용 가능
 */

// ============================================================================
// Auth Configuration
// ============================================================================

export interface AuthEndpoints {
  login: string;
  logout: string;
  refresh: string;
  me: string;
  register?: string;
}

export interface TokenRefreshConfig {
  enabled: boolean;
  /** 토큰 만료 전 갱신 시작 시간 (초) */
  thresholdSeconds: number;
  /** 자동 갱신 여부 */
  autoRefresh: boolean;
}

export interface AuthConfig {
  /** API 기본 URL */
  apiUrl: string;
  /** 인증 관련 엔드포인트 */
  endpoints: AuthEndpoints;
  /** 토큰 갱신 설정 */
  tokenRefresh: TokenRefreshConfig;
  /** 쿠키 설정 */
  cookie?: {
    name: string;
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
  };
}

const DEFAULT_AUTH_ENDPOINTS: AuthEndpoints = {
  login: '/api/auth/login',
  logout: '/api/auth/logout',
  refresh: '/api/auth/refresh',
  me: '/api/auth/me',
  register: '/api/auth/register',
};

const DEFAULT_TOKEN_REFRESH: TokenRefreshConfig = {
  enabled: true,
  thresholdSeconds: 300, // 5분 전
  autoRefresh: true,
};

/**
 * AuthConfig 생성 함수
 *
 * @example
 * // 기본 설정 사용
 * const config = createAuthConfig();
 *
 * // 커스텀 설정
 * const config = createAuthConfig({
 *   apiUrl: 'https://api.myapp.com',
 *   endpoints: { login: '/auth/signin' },
 * });
 */
export function createAuthConfig(overrides?: Partial<AuthConfig>): AuthConfig {
  return {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    endpoints: {
      ...DEFAULT_AUTH_ENDPOINTS,
      ...overrides?.endpoints,
    },
    tokenRefresh: {
      ...DEFAULT_TOKEN_REFRESH,
      ...overrides?.tokenRefresh,
    },
    cookie: overrides?.cookie,
  };
}

// ============================================================================
// Boards Configuration
// ============================================================================

export interface BoardsEndpoints {
  boards: string;
  posts: string;
  uploadImages: string;
  uploadAttachments: string;
}

export interface UploadConfig {
  /** 최대 파일 크기 (bytes) */
  maxFileSize: number;
  /** 허용된 파일 타입 */
  allowedTypes: string[];
  /** 이미지 최대 크기 */
  maxImageSize?: number;
  /** 첨부파일 최대 개수 */
  maxAttachments?: number;
}

export interface BoardsConfig {
  /** API 기본 URL */
  apiUrl: string;
  /** 게시판 관련 엔드포인트 */
  endpoints: BoardsEndpoints;
  /** 파일 업로드 설정 */
  upload: UploadConfig;
  /** 페이지네이션 기본값 */
  pagination?: {
    defaultPageSize: number;
    maxPageSize: number;
  };
}

const DEFAULT_BOARDS_ENDPOINTS: BoardsEndpoints = {
  boards: '/api/boards',
  posts: '/api/boards/{boardId}/posts',
  uploadImages: '/api/boards/upload/images',
  uploadAttachments: '/api/boards/upload/attachments',
};

const DEFAULT_UPLOAD_CONFIG: UploadConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
  maxImageSize: 5 * 1024 * 1024, // 5MB
  maxAttachments: 10,
};

/**
 * BoardsConfig 생성 함수
 *
 * @example
 * const config = createBoardsConfig({
 *   apiUrl: 'https://api.myapp.com',
 *   upload: { maxFileSize: 20 * 1024 * 1024 },
 * });
 */
export function createBoardsConfig(overrides?: Partial<BoardsConfig>): BoardsConfig {
  return {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    endpoints: {
      ...DEFAULT_BOARDS_ENDPOINTS,
      ...overrides?.endpoints,
    },
    upload: {
      ...DEFAULT_UPLOAD_CONFIG,
      ...overrides?.upload,
    },
    pagination: {
      defaultPageSize: 20,
      maxPageSize: 100,
      ...overrides?.pagination,
    },
  };
}

// ============================================================================
// Combined App Configuration
// ============================================================================

export interface AppConfig {
  auth: AuthConfig;
  boards: BoardsConfig;
}

/**
 * 전체 앱 설정 생성 함수
 */
export function createAppConfig(overrides?: Partial<AppConfig>): AppConfig {
  return {
    auth: createAuthConfig(overrides?.auth),
    boards: createBoardsConfig(overrides?.boards),
  };
}
