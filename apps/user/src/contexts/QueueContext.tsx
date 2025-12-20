'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getUserId } from '@/lib/user';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface QueueEntry {
  productId: number;
  position: number;
  isAllowed: boolean;
  message: string;
  websocket: WebSocket | null;
}

interface QueueContextType {
  activeQueues: Map<number, QueueEntry>;
  joinQueue: (productId: number) => Promise<boolean>;
  leaveQueue: (productId: number) => void;
  leaveAllQueues: () => void;
  checkQueueStatus: (productId: number) => Promise<{ isOccupied: boolean; queueLength: number } | null>;
  getQueueEntry: (productId: number) => QueueEntry | undefined;
}

const QueueContext = createContext<QueueContextType | null>(null);

export function QueueProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [activeQueues, setActiveQueues] = useState<Map<number, QueueEntry>>(new Map());
  const heartbeatRefs = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const userIdRef = useRef<string>('');

  useEffect(() => {
    userIdRef.current = getUserId();
  }, []);

  const checkQueueStatus = useCallback(async (productId: number) => {
    try {
      const res = await fetch(`${API_URL}/api/products/${productId}/queue/status`);
      const data = await res.json();
      if (data.success) {
        return {
          isOccupied: data.data.is_occupied,
          queueLength: data.data.queue_length,
        };
      }
      return null;
    } catch (error) {
      console.error('Failed to check queue status:', error);
      return null;
    }
  }, []);

  const joinQueue = useCallback(async (productId: number): Promise<boolean> => {
    const userId = userIdRef.current;
    if (!userId) {
      toast.error('사용자 정보를 불러올 수 없습니다.');
      return false;
    }

    // 이미 해당 상품 대기열에 있는 경우
    if (activeQueues.has(productId)) {
      const entry = activeQueues.get(productId)!;
      if (entry.isAllowed) {
        router.push(`/auctions/${productId}`);
        return true;
      }
      toast.info(`이미 대기열에 있습니다. ${entry.position}번째`);
      return false;
    }

    return new Promise((resolve) => {
      const ws = new WebSocket(
        `${WS_URL}/ws/products/${productId}/queue?user_id=${userId}`
      );

      ws.onopen = () => {
        // Heartbeat 시작
        const heartbeat = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'heartbeat' }));
          }
        }, 30000);
        heartbeatRefs.current.set(productId, heartbeat);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case 'init':
              setActiveQueues((prev) => {
                const newMap = new Map(prev);
                newMap.set(productId, {
                  productId,
                  position: data.position,
                  isAllowed: data.success,
                  message: data.message,
                  websocket: ws,
                });
                return newMap;
              });

              if (data.success) {
                // 바로 입장 가능
                router.push(`/auctions/${productId}`);
                resolve(true);
              } else {
                // 대기열에 추가됨
                toast.warning('다른 사용자가 보고 있습니다', {
                  description: `대기열 ${data.position}번째입니다. 순서가 되면 자동으로 이동합니다.`,
                  duration: 10000,
                });
                resolve(false);
              }
              break;

            case 'enter_allowed':
              setActiveQueues((prev) => {
                const newMap = new Map(prev);
                const entry = newMap.get(productId);
                if (entry) {
                  newMap.set(productId, {
                    ...entry,
                    isAllowed: true,
                    position: 0,
                  });
                }
                return newMap;
              });

              toast.success('입장 순서가 되었습니다!', {
                description: '상품 상세 페이지로 이동합니다.',
                duration: 3000,
              });

              router.push(`/auctions/${data.product_id}`);
              break;

            case 'queue_update':
              setActiveQueues((prev) => {
                const newMap = new Map(prev);
                const entry = newMap.get(productId);
                if (entry) {
                  newMap.set(productId, {
                    ...entry,
                    position: data.position,
                    message: data.message,
                  });
                }
                return newMap;
              });

              toast.info(`대기열 순서 업데이트: ${data.position}번째`, {
                duration: 3000,
              });
              break;
          }
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      };

      ws.onclose = () => {
        const heartbeat = heartbeatRefs.current.get(productId);
        if (heartbeat) {
          clearInterval(heartbeat);
          heartbeatRefs.current.delete(productId);
        }

        setActiveQueues((prev) => {
          const newMap = new Map(prev);
          newMap.delete(productId);
          return newMap;
        });
      };

      ws.onerror = () => {
        toast.error('연결에 실패했습니다.');
        resolve(false);
      };
    });
  }, [activeQueues, router]);

  const leaveQueue = useCallback((productId: number) => {
    const entry = activeQueues.get(productId);
    if (entry?.websocket) {
      if (entry.websocket.readyState === WebSocket.OPEN) {
        entry.websocket.send(JSON.stringify({ type: 'leave' }));
      }
      entry.websocket.close();
    }

    const heartbeat = heartbeatRefs.current.get(productId);
    if (heartbeat) {
      clearInterval(heartbeat);
      heartbeatRefs.current.delete(productId);
    }

    setActiveQueues((prev) => {
      const newMap = new Map(prev);
      newMap.delete(productId);
      return newMap;
    });
  }, [activeQueues]);

  const leaveAllQueues = useCallback(() => {
    activeQueues.forEach((entry, productId) => {
      if (entry.websocket) {
        if (entry.websocket.readyState === WebSocket.OPEN) {
          entry.websocket.send(JSON.stringify({ type: 'leave' }));
        }
        entry.websocket.close();
      }

      const heartbeat = heartbeatRefs.current.get(productId);
      if (heartbeat) {
        clearInterval(heartbeat);
      }
    });

    heartbeatRefs.current.clear();
    setActiveQueues(new Map());
  }, [activeQueues]);

  const getQueueEntry = useCallback((productId: number) => {
    return activeQueues.get(productId);
  }, [activeQueues]);

  // 페이지 이탈 시 모든 대기열 정리
  useEffect(() => {
    const handleBeforeUnload = () => {
      leaveAllQueues();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [leaveAllQueues]);

  return (
    <QueueContext.Provider
      value={{
        activeQueues,
        joinQueue,
        leaveQueue,
        leaveAllQueues,
        checkQueueStatus,
        getQueueEntry,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
}

export function useQueue() {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
}
