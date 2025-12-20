/**
 * 공유 타입 정의
 * 백엔드 API 스키마와 동기화됨
 */

// ============================================
// 사용자 관련 타입
// ============================================

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  profile_image?: string;
  provider: 'kakao' | 'naver' | 'google' | 'email';
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'user' | 'admin' | 'super_admin';

export interface AdminUser extends User {
  role: 'admin' | 'super_admin';
  permissions: AdminPermission[];
}

export type AdminPermission =
  | 'products:read' | 'products:write' | 'products:delete'
  | 'users:read' | 'users:write' | 'users:delete'
  | 'payments:read' | 'payments:write'
  | 'points:read' | 'points:write'
  | 'visitors:read'
  | 'banners:read' | 'banners:write' | 'banners:delete';

// ============================================
// 상품 관련 타입
// ============================================

export type ProductStatus = 'pending' | 'approved' | 'active' | 'ended' | 'cancelled';
export type AuctionType = 'general' | 'slot';

export interface Product {
  id: number;
  seller_id: number;
  title: string;
  description?: string;
  category?: string;        // 레거시 (문자열)
  category_id?: number;     // 카테고리 FK
  category_name?: string;   // 카테고리명 (조인)
  auction_type: AuctionType | string;
  starting_price: number;
  current_price?: number;
  buy_now_price?: number;
  min_bid_increment: number;
  slot_price?: number;
  slot_count: number;
  sold_slot_count: number;
  start_time?: string;
  end_time?: string;
  bid_count: number;
  status: ProductStatus | string;
  is_featured: boolean;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductListItem {
  id: number;
  title: string;
  description?: string;
  category?: string;
  category_id?: number;
  category_name?: string;
  auction_type: AuctionType | string;
  starting_price: number;
  current_price?: number;
  slot_price?: number;
  slot_count: number;
  sold_slot_count: number;
  bid_count: number;
  status: ProductStatus | string;
  is_featured: boolean;
  thumbnail_url?: string;
  end_time?: string;
  created_at: string;
}

export interface ProductCreate {
  seller_id: number;
  title: string;
  description?: string;
  category?: string;
  category_id?: number;
  auction_type?: AuctionType | string;
  starting_price: number;
  buy_now_price?: number;
  min_bid_increment?: number;
  slot_price?: number;
  slot_count?: number;
  start_time?: string;
  end_time?: string;
  thumbnail_url?: string;
}

export interface ProductUpdate {
  title?: string;
  description?: string;
  category?: string;
  category_id?: number;
  auction_type?: AuctionType | string;
  starting_price?: number;
  buy_now_price?: number;
  min_bid_increment?: number;
  slot_price?: number;
  slot_count?: number;
  start_time?: string;
  end_time?: string;
  status?: ProductStatus | string;
  is_featured?: boolean;
  thumbnail_url?: string;
}

export interface ProductStats {
  total: number;
  pending: number;
  approved: number;
  active: number;
  ended: number;
  cancelled: number;
}

// ============================================
// 슬롯 관련 타입
// ============================================

export type SlotStatus = 'available' | 'reserved' | 'purchased' | 'cancelled';

export interface SlotListItem {
  id: number;
  slot_number: number;
  buyer_id?: number;
  status: SlotStatus | string;
  paid_price?: number;
  purchased_at?: string;
}

export interface SlotStats {
  total: number;
  available: number;
  reserved: number;
  purchased: number;
  cancelled: number;
}

// ============================================
// 카테고리 관련 타입
// ============================================

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CategoryListItem {
  id: number;
  name: string;
  slug: string;
  parent_id?: number;
  sort_order: number;
  is_active: boolean;
  product_count?: number;
}

export interface CategoryTree extends CategoryListItem {
  children: CategoryTree[];
}

// ============================================
// 결제 관련 타입
// ============================================

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'card' | 'bank_transfer' | 'point' | 'mixed';

export interface Payment {
  id: number;
  user_id: number;
  product_id: number;
  amount: number;
  point_used: number;
  status: PaymentStatus;
  method: PaymentMethod;
  transaction_id?: string;
  refunded_at?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// 포인트 관련 타입
// ============================================

export type PointTransactionType = 'earn' | 'spend' | 'refund' | 'admin_grant' | 'admin_deduct' | 'expire';

export interface PointTransaction {
  id: number;
  user_id: number;
  amount: number;
  balance: number;
  type: PointTransactionType;
  description: string;
  related_id?: number;
  admin_id?: number;
  created_at: string;
}

export interface UserPointBalance {
  user_id: number;
  balance: number;
  lifetime_earned: number;
  lifetime_spent: number;
  updated_at: string;
}

// ============================================
// 접속자 관련 타입
// ============================================

export interface VisitorLog {
  id: number;
  user_id?: number;
  session_id: string;
  ip_address: string;
  user_agent: string;
  path: string;
  referer?: string;
  created_at: string;
}

export interface VisitorStats {
  today: number;
  week: number;
  month: number;
  current: number;
  daily: DailyVisitorData[];
}

export interface DailyVisitorData {
  date: string;
  visitors: number;
  page_views: number;
  unique_users: number;
}

// ============================================
// 배너 관련 타입
// ============================================

export type BannerPosition = 'main_top' | 'main_middle' | 'main_bottom' | 'sidebar' | 'popup';

export interface Banner {
  id: number;
  title: string;
  image_url: string;
  mobile_image_url?: string;
  link_url?: string;
  position: BannerPosition;
  priority: number;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  click_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface BannerCreate {
  title: string;
  image_url: string;
  mobile_image_url?: string;
  link_url?: string;
  position: BannerPosition;
  priority?: number;
  is_active?: boolean;
  start_date?: string;
  end_date?: string;
}

// ============================================
// API 응답 타입 (백엔드 스키마와 동기화)
// ============================================

export interface SuccessResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ErrorResponse {
  success: false;
  message: string;
  error_code?: string;
  details?: Record<string, unknown>;
}

export interface ApiError {
  code: string;
  message: string;
  detail?: string;
  details?: Record<string, unknown>;
}

export interface PaginationMeta {
  page: number;
  page_size: number;
  total_count: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: T[];
  meta: PaginationMeta;
}

// ============================================
// 대시보드 통계 타입
// ============================================

export interface DashboardStats {
  users: {
    total: number;
    new_today: number;
    new_this_week: number;
  };
  products: {
    total: number;
    active: number;
    ended_today: number;
  };
  payments: {
    today_total: number;
    today_count: number;
    month_total: number;
  };
  visitors: {
    today: number;
    current: number;
  };
}
