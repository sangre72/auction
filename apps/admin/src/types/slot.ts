/**
 * 슬롯 관련 타입 정의 (Admin App 전용)
 * SlotListItem, SlotStats는 @auction/shared에서 import
 */

// 슬롯 상세 타입 (admin 전용 확장 - 추가 필드 포함)
export interface Slot {
  id: number;
  product_id: number;
  slot_number: number;
  buyer_id?: number;
  status: string;
  payment_id?: number;
  paid_price?: number;
  reserved_at?: string;
  purchased_at?: string;
  cancelled_at?: string;
  buyer_note?: string;
  admin_note?: string;
  created_at: string;
  updated_at: string;
}
