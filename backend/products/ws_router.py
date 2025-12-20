"""
상품 대기열 WebSocket 라우터
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import Optional
import json

from .queue_manager import queue_manager

router = APIRouter(tags=["상품 대기열 WebSocket"])


@router.websocket("/ws/products/{product_id}/queue")
async def product_queue_websocket(
    websocket: WebSocket,
    product_id: int,
    user_id: str = Query(..., description="사용자 ID"),
):
    """
    상품 상세 페이지 대기열 WebSocket

    연결 시 자동으로 대기열에 등록됨
    - 빈 자리면 바로 입장 (success: true)
    - 다른 사용자가 보고 있으면 대기열에 추가 (success: false, position: N)

    메시지 타입:
    - enter_allowed: 입장 허용됨 (자동 리다이렉트 필요)
    - queue_update: 대기열 순서 변경
    - heartbeat: 연결 유지용
    """
    await websocket.accept()

    try:
        # 대기열 진입 시도
        result = await queue_manager.try_enter(product_id, user_id, websocket)
        await websocket.send_json({
            "type": "init",
            **result
        })

        # 연결 유지 및 메시지 수신
        while True:
            try:
                data = await websocket.receive_text()
                message = json.loads(data)

                if message.get("type") == "heartbeat":
                    await websocket.send_json({"type": "heartbeat", "status": "ok"})

                elif message.get("type") == "leave":
                    # 명시적 퇴장
                    next_user = await queue_manager.leave(product_id, user_id)
                    if next_user:
                        await queue_manager.notify_enter(next_user, product_id)
                    await websocket.send_json({"type": "left", "message": "퇴장했습니다."})

            except json.JSONDecodeError:
                pass

    except WebSocketDisconnect:
        # 연결 해제 시 대기열에서 제거
        await queue_manager.disconnect(user_id, product_id)


@router.get("/api/products/{product_id}/queue/status")
async def get_queue_status(product_id: int):
    """상품 대기열 상태 조회 (REST API)"""
    status = await queue_manager.get_queue_status(product_id)
    return {"success": True, "data": status}


@router.get("/api/products/queue/all")
async def get_all_queue_status():
    """모든 상품 대기열 상태 조회"""
    statuses = queue_manager.get_all_queue_status()
    return {"success": True, "data": statuses}
