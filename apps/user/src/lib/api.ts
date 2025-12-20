/**
 * API 클라이언트 유틸리티 (User App)
 */

// 공유 타입 import
import type {
  Product,
  ProductListItem,
  SlotListItem,
  SlotStats,
  PaginatedResponse,
  SuccessResponse,
} from '@auction/shared';

// 타입 re-export
export type { Product, ProductListItem, SlotListItem, SlotStats, PaginatedResponse, SuccessResponse };

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
