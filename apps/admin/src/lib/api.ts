/**
 * API 클라이언트 유틸리티
 */

// 공유 타입 import
import type {
  Product,
  ProductListItem,
  ProductCreate,
  ProductUpdate,
  ProductStats,
  SlotListItem,
  SlotStats,
  Category,
  CategoryListItem,
  CategoryTree,
  PaginatedResponse,
  SuccessResponse,
  Board,
  BoardListItem,
  BoardCreate,
  BoardUpdate,
  BoardStats,
  Post,
  PostListItem,
  PostUpdate,
} from '@auction/shared';

// 타입 re-export
export type {
  Product,
  ProductListItem,
  ProductCreate,
  ProductUpdate,
  ProductStats,
  SlotListItem,
  SlotStats,
  Category,
  CategoryListItem,
  CategoryTree,
  PaginatedResponse,
  SuccessResponse,
  Board,
  BoardListItem,
  BoardCreate,
  BoardUpdate,
  BoardStats,
  Post,
  PostListItem,
  PostUpdate,
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
    return localStorage.getItem('admin_token');
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

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

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

  // GET 요청
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

  // POST 요청
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PATCH 요청
  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE 요청
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // 파일 업로드
  async upload<T>(endpoint: string, formData: FormData): Promise<T> {
    const token = this.getAuthToken();

    const headers: HeadersInit = {};
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw { detail: error.detail || 'Upload failed', status: response.status };
    }

    return response.json();
  }
}

export const api = new ApiClient(API_URL);

// PaginatedResponse, SuccessResponse는 @auction/shared에서 import됨
// Slot (admin 전용 확장)은 @/types에서 import
import type { Slot } from '@/types/slot';
export type { Slot };

// API 함수들
export const productsApi = {
  // 상품 목록 조회
  getList: (params?: {
    page?: number;
    page_size?: number;
    title?: string;
    category?: string;
    status?: string;
    auction_type?: string;
    is_featured?: boolean;
    seller_id?: number;
  }) => api.get<PaginatedResponse<ProductListItem>>('/products', params),

  // 상품 통계
  getStats: () => api.get<SuccessResponse<ProductStats>>('/products/stats'),

  // 상품 상세
  getById: (id: number) => api.get<SuccessResponse<Product>>(`/products/${id}`),

  // 상품 생성
  create: (data: ProductCreate) => api.post<SuccessResponse<Product>>('/products', data),

  // 상품 수정
  update: (id: number, data: ProductUpdate) =>
    api.patch<SuccessResponse<Product>>(`/products/${id}`, data),

  // 상품 삭제
  delete: (id: number) => api.delete<SuccessResponse<null>>(`/products/${id}`),

  // 상품 승인
  approve: (id: number) => api.post<SuccessResponse<Product>>(`/products/${id}/approve`),

  // 상품 반려
  reject: (id: number) => api.post<SuccessResponse<Product>>(`/products/${id}/reject`),

  // 추천 상품 설정
  setFeatured: (id: number, is_featured: boolean) =>
    api.post<SuccessResponse<Product>>(`/products/${id}/featured?is_featured=${is_featured}`),
};

export const slotsApi = {
  // 상품의 슬롯 목록
  getByProduct: (productId: number) =>
    api.get<SuccessResponse<SlotListItem[]>>(`/products/${productId}/slots`),

  // 슬롯 통계
  getStats: (productId: number) =>
    api.get<SuccessResponse<SlotStats>>(`/products/${productId}/slots/stats`),

  // 슬롯 상세
  getById: (slotId: number) => api.get<SuccessResponse<Slot>>(`/products/slots/${slotId}`),

  // 슬롯 수정
  update: (slotId: number, data: { status?: string; admin_note?: string }) =>
    api.patch<SuccessResponse<Slot>>(`/products/slots/${slotId}`, data),

  // 슬롯 구매
  purchase: (productId: number, data: { buyer_id: number; slot_numbers: number[]; buyer_note?: string }) =>
    api.post<SuccessResponse<Slot[]>>(`/products/${productId}/slots/purchase`, data),

  // 구매 확정
  confirm: (slotId: number, paymentId: number) =>
    api.post<SuccessResponse<Slot>>(`/products/slots/${slotId}/confirm?payment_id=${paymentId}`),

  // 슬롯 취소
  cancel: (slotId: number, adminNote?: string) =>
    api.post<SuccessResponse<Slot>>(`/products/slots/${slotId}/cancel${adminNote ? `?admin_note=${encodeURIComponent(adminNote)}` : ''}`),

  // 슬롯 초기화
  reset: (slotId: number) => api.post<SuccessResponse<Slot>>(`/products/slots/${slotId}/reset`),
};

// 카테고리 API
export const categoriesApi = {
  // 카테고리 목록 조회
  getList: (params?: { parent_id?: number; is_active?: boolean; level?: number }) =>
    api.get<SuccessResponse<CategoryListItem[]>>('/categories', params),

  // 카테고리 트리 조회
  getTree: () => api.get<SuccessResponse<CategoryTree[]>>('/categories/tree'),

  // 카테고리 통계
  getStats: () => api.get<SuccessResponse<{ total: number; active: number; inactive: number }>>('/categories/stats'),

  // 카테고리 상세 조회
  getById: (id: number) => api.get<SuccessResponse<Category>>(`/categories/${id}`),

  // 카테고리 생성
  create: (data: {
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    image_url?: string;
    parent_id?: number;
    sort_order?: number;
    is_active?: boolean;
  }) => api.post<SuccessResponse<Category>>('/categories', data),

  // 카테고리 수정
  update: (id: number, data: {
    name?: string;
    slug?: string;
    description?: string;
    icon?: string;
    image_url?: string;
    parent_id?: number;
    sort_order?: number;
    is_active?: boolean;
  }) => api.patch<SuccessResponse<Category>>(`/categories/${id}`, data),

  // 카테고리 삭제
  delete: (id: number) => api.delete<SuccessResponse<null>>(`/categories/${id}`),
};

// 게시판 API
export const boardsApi = {
  // 게시판 목록 조회
  getList: (params?: { is_active?: boolean }) =>
    api.get<PaginatedResponse<BoardListItem>>('/boards', params),

  // 게시판 통계
  getStats: () => api.get<SuccessResponse<BoardStats>>('/boards/stats'),

  // 게시판 상세 조회
  getById: (id: number) => api.get<SuccessResponse<Board>>(`/boards/${id}`),

  // 게시판 생성
  create: (data: BoardCreate) => api.post<SuccessResponse<Board>>('/boards', data),

  // 게시판 수정
  update: (id: number, data: BoardUpdate) =>
    api.patch<SuccessResponse<Board>>(`/boards/${id}`, data),

  // 게시판 삭제
  delete: (id: number) => api.delete<SuccessResponse<null>>(`/boards/${id}`),

  // 게시판 순서 변경
  reorder: (ids: number[]) => api.post<SuccessResponse<null>>('/boards/reorder', ids),
};

// 게시글 관리 API (Admin)
export const postsApi = {
  // 게시글 목록 조회 (게시판별)
  getList: (boardId: number, params?: {
    page?: number;
    page_size?: number;
    title?: string;
    status?: string;
    is_pinned?: boolean;
    is_notice?: boolean;
  }) => api.get<PaginatedResponse<PostListItem>>(`/boards/${boardId}/posts`, params),

  // 게시글 상세 조회
  getById: (id: number) => api.get<SuccessResponse<Post>>(`/boards/posts/${id}`),

  // 게시글 수정
  update: (id: number, data: PostUpdate) =>
    api.patch<SuccessResponse<Post>>(`/boards/posts/${id}`, data),

  // 게시글 삭제
  delete: (id: number) => api.delete<SuccessResponse<null>>(`/boards/posts/${id}`),

  // 공지 설정
  setNotice: (id: number, is_notice: boolean) =>
    api.post<SuccessResponse<Post>>(`/boards/posts/${id}/notice?is_notice=${is_notice}`),
};
