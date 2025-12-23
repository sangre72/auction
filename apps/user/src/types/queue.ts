/**
 * 대기열 관련 타입 정의 (User App 전용)
 */

export interface QueueViewer {
  user_id: string;
  joined_at: string;
  position: number;
  status: 'viewing' | 'waiting';
}

export interface UseProductQueueOptions {
  productId: number;
  userId: string;
  onEnterAllowed?: (productId: number) => void;
  autoConnect?: boolean;
}

export interface QueueListData {
  product_id: number;
  total_count: number;
  viewers: QueueViewer[];
}

export interface QueueState {
  isConnected: boolean;
  isAllowed: boolean;
  position: number;
  message: string;
  queueList: QueueListData | null;
}

export interface QueueStatus {
  isOccupied: boolean;
  queueLength: number;
  currentViewerId: string | null;
}
