'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import type { QueueState, QueueStatus, UseProductQueueOptions } from '@/types/queue';

// 타입 re-export
export type { QueueViewer, QueueListData, QueueState, QueueStatus, UseProductQueueOptions } from '@/types/queue';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

export function useProductQueue({
  productId,
  userId,
  onEnterAllowed,
  autoConnect = true,
}: UseProductQueueOptions) {
  const [state, setState] = useState<QueueState>({
    isConnected: false,
    isAllowed: false,
    position: 0,
    message: '',
    queueList: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectRef = useRef<NodeJS.Timeout | null>(null);
  const onEnterAllowedRef = useRef(onEnterAllowed);

  // 콜백 ref 업데이트
  useEffect(() => {
    onEnterAllowedRef.current = onEnterAllowed;
  }, [onEnterAllowed]);

  const disconnect = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }

    if (reconnectRef.current) {
      clearTimeout(reconnectRef.current);
      reconnectRef.current = null;
    }

    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'leave' }));
      }
      wsRef.current.close();
      wsRef.current = null;
    }

    setState({
      isConnected: false,
      isAllowed: false,
      position: 0,
      message: '',
      queueList: null,
    });
  }, []);

  const leave = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'leave' }));
    }
  }, []);

  // WebSocket 연결 및 메시지 처리
  useEffect(() => {
    if (!autoConnect || !productId || !userId) {
      return;
    }

    // 이미 연결된 경우 스킵
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const ws = new WebSocket(
      `${WS_URL}/ws/products/${productId}/queue?user_id=${userId}`
    );

    ws.onopen = () => {
      setState((prev) => ({ ...prev, isConnected: true }));

      // 연결 즉시 대기열 목록 요청
      ws.send(JSON.stringify({ type: 'get_queue_list' }));

      // Heartbeat 시작
      heartbeatRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'heartbeat' }));
        }
      }, 30000);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'init':
            setState((prev) => ({
              ...prev,
              isAllowed: data.success,
              position: data.position,
              message: data.message,
            }));

            if (!data.success) {
              toast.warning(data.message, {
                description: '순서가 되면 자동으로 입장됩니다.',
                duration: 10000,
              });
            }
            break;

          case 'enter_allowed':
            setState((prev) => ({
              ...prev,
              isAllowed: true,
              position: 0,
              message: data.message,
            }));

            toast.success('입장 순서가 되었습니다!', {
              description: '상품 상세 페이지로 이동합니다.',
              duration: 3000,
            });

            onEnterAllowedRef.current?.(data.product_id);
            break;

          case 'queue_update':
            setState((prev) => ({
              ...prev,
              position: data.position,
              message: data.message,
            }));

            toast.info(`대기열 순서: ${data.position}번째`, {
              duration: 3000,
            });
            break;

          case 'left':
            setState((prev) => ({
              ...prev,
              isAllowed: false,
              position: 0,
            }));
            break;

          case 'queue_list':
            setState((prev) => ({
              ...prev,
              queueList: data.data,
            }));
            break;
        }
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    };

    ws.onclose = () => {
      setState((prev) => ({ ...prev, isConnected: false }));

      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current = ws;

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }

      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }

      if (wsRef.current) {
        if (wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: 'leave' }));
        }
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [productId, userId, autoConnect]);

  // 수동 연결 함수 (외부에서 호출 가능)
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }
    // autoConnect가 true이면 useEffect에서 자동 연결됨
    // 수동 연결이 필요한 경우 이 함수 확장 가능
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    leave,
  };
}

// 대기열 상태만 조회하는 훅 (WebSocket 연결 없이)
export function useQueueStatus(productId: number) {
  const [status, setStatus] = useState<QueueStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/products/${productId}/queue/status`
      );
      const data = await res.json();

      if (data.success) {
        setStatus({
          isOccupied: data.data.is_occupied,
          queueLength: data.data.queue_length,
          currentViewerId: data.data.current_viewer_id,
        });
      }
    } catch (error) {
      console.error('Failed to fetch queue status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return { status, isLoading, refetch: fetchStatus };
}
