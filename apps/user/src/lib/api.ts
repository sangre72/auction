/**
 * API 클라이언트 유틸리티 (User App)
 */

import { handleSecurityResponse } from './security';

// 공유 타입 import
import type {
  Product,
  ProductListItem,
  SlotListItem,
  SlotStats,
  PaginatedResponse,
  SuccessResponse,
  Board,
  BoardListItem,
  PostListItem,
  Post,
  PostCreate as SharedPostCreate,
  PostUpdate,
  Comment,
  CommentCreate,
  CommentUpdate,
} from '@auction/shared';

// User 앱 전용 타입 (공개 API에서는 board_id가 URL에 포함됨)
export interface PostCreate extends Omit<SharedPostCreate, 'board_id'> {
  board_id?: never; // board_id는 URL에서 처리됨
}

// 타입 re-export
export type {
  Product,
  ProductListItem,
  SlotListItem,
  SlotStats,
  PaginatedResponse,
  SuccessResponse,
  Board,
  BoardListItem,
  PostListItem,
  Post,
  PostUpdate,
  Comment,
  CommentCreate,
  CommentUpdate,
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface ApiError {
  detail: string;
  status: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('user_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include', // httpOnly 쿠키 자동 전송
      });
    } catch (networkError) {
      throw {
        detail: '서버에 연결할 수 없습니다.',
        status: 0,
      };
    }

    // 보안 응답 처리 (403, 429)
    if (response.status === 403 || response.status === 429) {
      const securityResult = await handleSecurityResponse(response.clone());
      if (securityResult.blocked) {
        const apiError: ApiError = {
          detail: securityResult.data?.error?.reason || '접근이 차단되었습니다.',
          status: response.status,
        };
        throw apiError;
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      const apiError: ApiError = {
        detail: error.detail || error.message || 'Request failed',
        status: response.status,
      };
      throw apiError;
    }

    return response.json();
  }

  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_URL);

// PaginatedResponse, SuccessResponse, Product, SlotListItem 등은 @auction/shared에서 import됨

// API 함수들 (공개 API 사용)
export const productsApi = {
  // 상품 목록 조회 (활성 상태만, 인증 불필요)
  getList: (params?: {
    page?: number;
    page_size?: number;
    title?: string;
    category?: string; // 레거시 (문자열 검색)
    category_id?: number; // 카테고리 FK 필터
    auction_type?: string;
    is_featured?: boolean;
  }) => api.get<PaginatedResponse<ProductListItem>>('/public/products', params),

  // 상품 상세 (인증 불필요)
  getById: (id: number) => api.get<SuccessResponse<Product>>(`/public/products/${id}`),
};

export const slotsApi = {
  // 상품의 슬롯 목록 (인증 불필요)
  getByProduct: (productId: number) =>
    api.get<SuccessResponse<SlotListItem[]>>(`/public/products/${productId}/slots`),

  // 슬롯 통계 (인증 불필요)
  getStats: (productId: number) =>
    api.get<SuccessResponse<SlotStats>>(`/public/products/${productId}/slots/stats`),

  // 슬롯 구매 예약 (인증 필요 - 관리자 API)
  purchase: (productId: number, data: { buyer_id: number; slot_numbers: number[]; buyer_note?: string }) =>
    api.post<SuccessResponse<SlotListItem[]>>(`/products/${productId}/slots/purchase`, data),
};

// 게시판 API (공개 API)
export const boardsApi = {
  // 활성 게시판 목록 조회
  getList: () => api.get<SuccessResponse<BoardListItem[]>>('/public/boards'),

  // 게시판 상세 조회 (slug로 조회) - Board 타입으로 write_permission 포함
  getBySlug: (slug: string) => api.get<SuccessResponse<Board>>(`/public/boards/${slug}`),
};

// 게시글 API (공개 API)
export const postsApi = {
  // 게시글 목록 조회
  getList: (boardSlug: string, params?: {
    page?: number;
    page_size?: number;
    title?: string;
  }) => api.get<PaginatedResponse<PostListItem>>(`/public/boards/${boardSlug}/posts`, params),

  // 게시글 상세 조회
  getById: (boardSlug: string, postId: number) =>
    api.get<SuccessResponse<Post>>(`/public/boards/${boardSlug}/posts/${postId}`),

  // 게시글 작성 (로그인 필요)
  create: (boardSlug: string, data: PostCreate) =>
    api.post<SuccessResponse<Post>>(`/public/boards/${boardSlug}/posts`, data),

  // 게시글 수정 (작성자만)
  update: (boardSlug: string, postId: number, data: PostUpdate) =>
    api.patch<SuccessResponse<Post>>(`/public/boards/${boardSlug}/posts/${postId}`, data),

  // 게시글 삭제 (작성자만)
  delete: (boardSlug: string, postId: number) =>
    api.delete<SuccessResponse<null>>(`/public/boards/${boardSlug}/posts/${postId}`),

  // 좋아요 토글 (로그인 필요)
  toggleLike: (boardSlug: string, postId: number) =>
    api.post<SuccessResponse<{ liked: boolean; like_count: number }>>(
      `/public/boards/${boardSlug}/posts/${postId}/like`
    ),
};

// 댓글 API (공개 API)
export const commentsApi = {
  // 게시글의 댓글 목록 조회
  getByPost: (boardSlug: string, postId: number) =>
    api.get<SuccessResponse<Comment[]>>(`/public/boards/${boardSlug}/posts/${postId}/comments`),

  // 댓글 작성 (로그인 필요)
  create: (boardSlug: string, postId: number, data: CommentCreate) =>
    api.post<SuccessResponse<Comment>>(
      `/public/boards/${boardSlug}/posts/${postId}/comments`,
      data
    ),

  // 댓글 수정 (작성자만)
  update: (boardSlug: string, postId: number, commentId: number, data: CommentUpdate) =>
    api.patch<SuccessResponse<Comment>>(
      `/public/boards/${boardSlug}/posts/${postId}/comments/${commentId}`,
      data
    ),

  // 댓글 삭제 (작성자만)
  delete: (boardSlug: string, postId: number, commentId: number) =>
    api.delete<SuccessResponse<null>>(
      `/public/boards/${boardSlug}/posts/${postId}/comments/${commentId}`
    ),
};
