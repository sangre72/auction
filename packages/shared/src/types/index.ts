/**
 * 공유 타입 정의
 * 백엔드 API 스키마와 동기화됨
 */

// 세션 관련 타입
export * from './session';

// 보안 관련 타입
export * from './security';

// ============================================
// 사용자 관련 타입
// ============================================

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'banned' | 'deleted';
export type UserProvider = 'kakao' | 'naver' | 'google' | 'email';
export type UserRole = 'user' | 'admin' | 'super_admin';
export type VerificationLevel = 'none' | 'email' | 'phone' | 'identity';

export interface User {
  id: number;
  email?: string;
  phone?: string;
  name?: string;
  nickname?: string;
  profile_image?: string;
  provider: UserProvider;
  status: UserStatus;
  is_verified: boolean;
  verification_level: VerificationLevel;
  point_balance: number;
  last_login_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface UserListItem {
  id: number;
  email?: string;
  name?: string;
  nickname?: string;
  provider: UserProvider;
  status: UserStatus;
  is_verified: boolean;
  verification_level: VerificationLevel;
  point_balance: number;
  last_login_at?: string;
  created_at: string;
}

export interface UserUpdate {
  name?: string;
  nickname?: string;
  phone?: string;
  status?: UserStatus;
  is_verified?: boolean;
}

export interface UserSearchParams {
  email?: string;
  name?: string;
  phone?: string;
  provider?: UserProvider;
  status?: UserStatus;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  suspended: number;
  banned: number;
}

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

// ============================================
// 게시판 관련 타입
// ============================================

export type BoardReadPermission = 'public' | 'login' | 'admin';
export type BoardWritePermission = 'login' | 'admin';
export type BoardCommentPermission = 'disabled' | 'login';
export type PostStatus = 'draft' | 'published' | 'hidden' | 'deleted';

export interface Board {
  id: number;
  name: string;
  title: string;
  description?: string;
  read_permission: BoardReadPermission;
  write_permission: BoardWritePermission;
  comment_permission: BoardCommentPermission;
  is_active: boolean;
  sort_order: number;
  allow_attachments: boolean;
  allow_images: boolean;
  max_attachments: number;
  created_at: string;
  updated_at: string;
}

export interface BoardListItem {
  id: number;
  name: string;
  title: string;
  description?: string;
  is_active: boolean;
  sort_order: number;
  post_count: number;
}

export interface BoardCreate {
  name: string;
  title: string;
  description?: string;
  read_permission?: BoardReadPermission;
  write_permission?: BoardWritePermission;
  comment_permission?: BoardCommentPermission;
  is_active?: boolean;
  sort_order?: number;
  allow_attachments?: boolean;
  allow_images?: boolean;
  max_attachments?: number;
}

export interface BoardUpdate {
  name?: string;
  title?: string;
  description?: string;
  read_permission?: BoardReadPermission;
  write_permission?: BoardWritePermission;
  comment_permission?: BoardCommentPermission;
  is_active?: boolean;
  sort_order?: number;
  allow_attachments?: boolean;
  allow_images?: boolean;
  max_attachments?: number;
}

export interface BoardStats {
  total: number;
  active: number;
  inactive: number;
  total_posts: number;
  today_posts: number;
}

// ============================================
// 게시글 관련 타입
// ============================================

export interface PostAuthor {
  id: number;
  name?: string;
  nickname?: string;
  profile_image?: string;
}

export interface PostImage {
  id: number;
  image_url: string;
  thumbnail_url?: string;
  original_filename?: string;
  sort_order: number;
}

export interface PostAttachment {
  id: number;
  file_url: string;
  original_filename: string;
  file_size: number;
  file_type?: string;
  download_count: number;
}

export interface Post {
  id: number;
  board_id: number;
  board_name: string;
  board_title: string;
  author?: PostAuthor;
  title: string;
  content: string;
  status: PostStatus;
  is_pinned: boolean;
  is_notice: boolean;
  view_count: number;
  like_count: number;
  comment_count: number;
  images: PostImage[];
  attachments: PostAttachment[];
  is_liked: boolean;
  created_at: string;
  updated_at: string;
}

export interface PostListItem {
  id: number;
  board_id: number;
  author_name?: string;
  title: string;
  status: PostStatus;
  is_pinned: boolean;
  is_notice: boolean;
  view_count: number;
  like_count: number;
  comment_count: number;
  has_images: boolean;
  has_attachments: boolean;
  created_at: string;
}

export interface PostCreate {
  board_id: number;
  title: string;
  content: string;
  is_pinned?: boolean;
  is_notice?: boolean;
  image_urls?: string[];
}

export interface PostUpdate {
  title?: string;
  content?: string;
  status?: PostStatus;
  is_pinned?: boolean;
  is_notice?: boolean;
}

export interface PostLikeStatus {
  is_liked: boolean;
  like_count: number;
}

// ============================================
// 댓글 관련 타입
// ============================================

export interface Comment {
  id: number;
  post_id: number;
  author?: PostAuthor;
  parent_id?: number;
  content: string;
  is_deleted: boolean;
  replies: Comment[];
  created_at: string;
  updated_at: string;
}

export interface CommentCreate {
  content: string;
  parent_id?: number;
}

export interface CommentUpdate {
  content: string;
}

// ============================================
// 금칙어 관련 타입
// ============================================

export type ForbiddenWordType = 'exact' | 'contains' | 'regex';
export type ForbiddenWordTarget = 'all' | 'post_title' | 'post_content' | 'comment' | 'nickname';

export interface ForbiddenWord {
  id: number;
  word: string;
  replacement?: string;
  match_type: ForbiddenWordType;
  target: ForbiddenWordTarget;
  is_active: boolean;
  reason?: string;
  created_at: string;
  updated_at: string;
}

export interface ForbiddenWordCreate {
  word: string;
  replacement?: string;
  match_type?: ForbiddenWordType;
  target?: ForbiddenWordTarget;
  is_active?: boolean;
  reason?: string;
}

export interface ForbiddenWordUpdate {
  word?: string;
  replacement?: string;
  match_type?: ForbiddenWordType;
  target?: ForbiddenWordTarget;
  is_active?: boolean;
  reason?: string;
}

export interface ForbiddenWordCheckResult {
  contains_forbidden: boolean;
  matched_words: string[];
  filtered_text?: string;
}
