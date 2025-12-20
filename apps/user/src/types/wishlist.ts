/**
 * 관심 상품 타입 정의
 */

export interface WishlistItem {
  id: number;
  product_id: number;
  product_title: string;
  product_thumbnail: string | null;
  current_price: number | null;
  starting_price: number;
  product_status: string;
  bid_count: number;
  slot_count: number;
  sold_slot_count: number;
  end_time: string | null;
  created_at: string;
}

export interface WishlistMeta {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface WishlistResponse {
  data: WishlistItem[];
  meta: WishlistMeta;
}

export interface UseWishlistReturn {
  items: WishlistItem[];
  isLoading: boolean;
  error: string | null;
  meta: WishlistMeta;
  fetchWishlist: (page?: number, pageSize?: number) => Promise<void>;
  checkWishlist: (productId: number) => Promise<boolean>;
  toggleWishlist: (productId: number) => Promise<{ success: boolean; isWishlisted: boolean; message: string }>;
  removeFromWishlist: (productId: number) => Promise<boolean>;
}
