/**
 * 관심 상품 훅
 * httpOnly 쿠키 기반 인증
 */

import { useState, useCallback } from 'react';
import type { WishlistItem, WishlistMeta, WishlistResponse, UseWishlistReturn } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export function useWishlist(): UseWishlistReturn {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<WishlistMeta>({
    page: 1,
    page_size: 20,
    total_count: 0,
    total_pages: 1,
    has_next: false,
    has_prev: false,
  });

  // 관심 상품 목록 조회
  const fetchWishlist = useCallback(async (page = 1, pageSize = 20) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/users/me/wishlist?page=${page}&page_size=${pageSize}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        if (response.status === 401) {
          setError('로그인이 필요합니다');
          setItems([]);
          return;
        }
        throw new Error('Failed to fetch wishlist');
      }

      const data: WishlistResponse = await response.json();
      setItems(data.data);
      setMeta(data.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 관심 상품 여부 확인
  const checkWishlist = useCallback(async (productId: number): Promise<boolean> => {
    try {
      const response = await fetch(
        `${API_URL}/users/me/wishlist/${productId}/check`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.data.is_wishlisted;
    } catch {
      return false;
    }
  }, []);

  // 관심 상품 토글
  const toggleWishlist = useCallback(async (productId: number): Promise<{ success: boolean; isWishlisted: boolean; message: string }> => {
    try {
      const response = await fetch(
        `${API_URL}/users/me/wishlist/${productId}`,
        {
          method: 'POST',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          return { success: false, isWishlisted: false, message: '로그인이 필요합니다' };
        }
        throw new Error('Failed to toggle wishlist');
      }

      const data = await response.json();
      return {
        success: true,
        isWishlisted: data.data.is_wishlisted,
        message: data.data.message,
      };
    } catch (err) {
      return {
        success: false,
        isWishlisted: false,
        message: err instanceof Error ? err.message : '오류가 발생했습니다',
      };
    }
  }, []);

  // 관심 상품 삭제
  const removeFromWishlist = useCallback(async (productId: number): Promise<boolean> => {
    try {
      const response = await fetch(
        `${API_URL}/users/me/wishlist/${productId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        return false;
      }

      // 목록에서 제거
      setItems(prev => prev.filter(item => item.product_id !== productId));
      setMeta(prev => ({ ...prev, total_count: prev.total_count - 1 }));
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    items,
    isLoading,
    error,
    meta,
    fetchWishlist,
    checkWishlist,
    toggleWishlist,
    removeFromWishlist,
  };
}
