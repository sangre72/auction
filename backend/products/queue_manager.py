"""
상품 상세 페이지 대기열 관리자
- 각 상품당 1명만 상세 페이지 진입 가능
- FIFO 방식 대기열 관리
- WebSocket을 통한 실시간 알림
"""

from typing import Dict, List, Optional
from dataclasses import dataclass, field
from datetime import datetime
import asyncio
from fastapi import WebSocket


@dataclass
class QueueEntry:
    """대기열 항목"""
    user_id: str
    websocket: WebSocket
    joined_at: datetime = field(default_factory=datetime.now)

    def to_dict(self) -> dict:
        """직렬화"""
        return {
            "user_id": self.user_id,
            "joined_at": self.joined_at.isoformat(),
        }


@dataclass
class ProductQueue:
    """상품별 대기열"""
    product_id: int
    current_viewer: Optional[QueueEntry] = None
    waiting_queue: List[QueueEntry] = field(default_factory=list)


class ProductQueueManager:
    """상품 대기열 관리자 (싱글톤)"""

    _instance: Optional['ProductQueueManager'] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True
        self._queues: Dict[int, ProductQueue] = {}
        self._user_connections: Dict[str, WebSocket] = {}
        self._lock = asyncio.Lock()

    def _get_or_create_queue(self, product_id: int) -> ProductQueue:
        """상품 대기열 조회 또는 생성"""
        if product_id not in self._queues:
            self._queues[product_id] = ProductQueue(product_id=product_id)
        return self._queues[product_id]

    async def get_queue_status(self, product_id: int) -> dict:
        """상품 대기열 상태 조회"""
        async with self._lock:
            queue = self._get_or_create_queue(product_id)
            return {
                "product_id": product_id,
                "is_occupied": queue.current_viewer is not None,
                "current_viewer_id": queue.current_viewer.user_id if queue.current_viewer else None,
                "queue_length": len(queue.waiting_queue),
                "waiting_users": [e.user_id for e in queue.waiting_queue],
            }

    async def try_enter(self, product_id: int, user_id: str, websocket: WebSocket) -> dict:
        """
        상품 상세 페이지 진입 시도
        Returns: {"success": bool, "position": int, "message": str}
        """
        async with self._lock:
            queue = self._get_or_create_queue(product_id)
            entry = QueueEntry(user_id=user_id, websocket=websocket)

            # 현재 사용자가 이미 보고 있는 경우
            if queue.current_viewer and queue.current_viewer.user_id == user_id:
                queue.current_viewer.websocket = websocket
                return {
                    "success": True,
                    "position": 0,
                    "message": "이미 상품을 보고 있습니다."
                }

            # 대기열에 이미 있는 경우
            for i, waiting in enumerate(queue.waiting_queue):
                if waiting.user_id == user_id:
                    waiting.websocket = websocket
                    return {
                        "success": False,
                        "position": i + 1,
                        "message": f"대기열 {i + 1}번째입니다."
                    }

            # 빈 자리가 있는 경우
            if queue.current_viewer is None:
                queue.current_viewer = entry
                self._user_connections[user_id] = websocket
                # 비동기로 목록 브로드캐스트 예약
                asyncio.create_task(self._broadcast_queue_list(product_id))
                return {
                    "success": True,
                    "position": 0,
                    "message": "상품 상세 페이지에 입장했습니다."
                }

            # 대기열에 추가
            queue.waiting_queue.append(entry)
            self._user_connections[user_id] = websocket
            position = len(queue.waiting_queue)
            # 비동기로 목록 브로드캐스트 예약
            asyncio.create_task(self._broadcast_queue_list(product_id))

            return {
                "success": False,
                "position": position,
                "message": f"현재 다른 사용자가 보고 있습니다. 대기열 {position}번째입니다."
            }

    async def leave(self, product_id: int, user_id: str) -> Optional[str]:
        """
        상품 상세 페이지 퇴장
        Returns: 다음 입장할 사용자 ID (있는 경우)
        """
        async with self._lock:
            if product_id not in self._queues:
                return None

            queue = self._queues[product_id]

            # 현재 보는 사용자가 나가는 경우
            if queue.current_viewer and queue.current_viewer.user_id == user_id:
                queue.current_viewer = None

                # 대기열에서 다음 사용자 입장
                if queue.waiting_queue:
                    next_entry = queue.waiting_queue.pop(0)
                    queue.current_viewer = next_entry

                    # 나머지 대기자들에게 순서 업데이트 알림
                    await self._notify_queue_update(product_id)

                    return next_entry.user_id

                return None

            # 대기열에서 나가는 경우
            queue.waiting_queue = [e for e in queue.waiting_queue if e.user_id != user_id]
            await self._notify_queue_update(product_id)

            return None

    async def _notify_queue_update(self, product_id: int):
        """대기열 업데이트 알림"""
        if product_id not in self._queues:
            return

        queue = self._queues[product_id]
        for i, entry in enumerate(queue.waiting_queue):
            try:
                await entry.websocket.send_json({
                    "type": "queue_update",
                    "position": i + 1,
                    "message": f"대기열 {i + 1}번째입니다."
                })
            except Exception:
                pass  # 연결 끊긴 경우 무시

        # 전체 목록도 브로드캐스트
        await self._broadcast_queue_list(product_id)

    async def _broadcast_queue_list(self, product_id: int):
        """대기열 목록을 모든 연결된 사용자에게 브로드캐스트"""
        if product_id not in self._queues:
            return

        queue = self._queues[product_id]
        queue_list = self._build_queue_list(queue)

        # 현재 보는 사람에게 전송
        if queue.current_viewer:
            try:
                await queue.current_viewer.websocket.send_json({
                    "type": "queue_list",
                    "data": queue_list
                })
            except Exception:
                pass

        # 대기 중인 사람들에게 전송
        for entry in queue.waiting_queue:
            try:
                await entry.websocket.send_json({
                    "type": "queue_list",
                    "data": queue_list
                })
            except Exception:
                pass

    def _build_queue_list(self, queue: ProductQueue) -> dict:
        """대기열 목록 데이터 생성"""
        viewers = []

        # 현재 보는 사람 (1번)
        if queue.current_viewer:
            viewers.append({
                **queue.current_viewer.to_dict(),
                "position": 0,
                "status": "viewing"
            })

        # 대기 중인 사람들
        for i, entry in enumerate(queue.waiting_queue):
            viewers.append({
                **entry.to_dict(),
                "position": i + 1,
                "status": "waiting"
            })

        return {
            "product_id": queue.product_id,
            "total_count": len(viewers),
            "viewers": viewers
        }

    async def notify_enter(self, user_id: str, product_id: int):
        """입장 알림 전송"""
        if user_id in self._user_connections:
            try:
                await self._user_connections[user_id].send_json({
                    "type": "enter_allowed",
                    "product_id": product_id,
                    "message": "입장 순서가 되었습니다!"
                })
            except Exception:
                pass

    async def disconnect(self, user_id: str, product_id: int):
        """WebSocket 연결 해제 처리"""
        next_user = await self.leave(product_id, user_id)

        if user_id in self._user_connections:
            del self._user_connections[user_id]

        if next_user:
            await self.notify_enter(next_user, product_id)

    def get_all_queue_status(self) -> List[dict]:
        """모든 상품 대기열 상태"""
        return [
            {
                "product_id": pid,
                "is_occupied": q.current_viewer is not None,
                "queue_length": len(q.waiting_queue),
            }
            for pid, q in self._queues.items()
        ]


# 싱글톤 인스턴스
queue_manager = ProductQueueManager()
