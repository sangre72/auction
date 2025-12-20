"""
결제 공개 라우터 (사용자용)
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone

from core.database import get_db
from core.security import get_current_user_from_cookie_optional
from common.responses import SuccessResponse
from .models import Payment, PaymentStatus
from products.models import Product, ProductSlot, SlotStatus

router = APIRouter(prefix="/public/payments", tags=["결제 (공개)"])


class SlotPurchaseRequest(BaseModel):
    """슬롯 구매 요청"""
    order_id: str
    payment_id: str  # 포트원 결제 ID
    product_id: int
    slot_numbers: List[int]
    paid_amount: int  # PortOne에서 확인된 실제 결제 금액
    payment_method: str  # kakaopay, tosspay 등
    user_id: Optional[int] = None  # 로그인 사용자


class SlotPurchaseResponse(BaseModel):
    """슬롯 구매 응답"""
    success: bool
    message: str
    payment_id: Optional[int] = None
    purchased_slots: List[int] = []


@router.post("/complete", response_model=SuccessResponse[SlotPurchaseResponse])
async def complete_purchase(
    request: SlotPurchaseRequest,
    db: Session = Depends(get_db),
    current_user: Optional[dict] = Depends(get_current_user_from_cookie_optional),
):
    """
    결제 완료 처리
    - 결제 정보 저장
    - 슬롯 상태 업데이트
    - 상품의 판매 슬롯 수 증가
    """
    # 사용자 ID 결정 (로그인 사용자 우선)
    user_id = current_user.get("id") if current_user else request.user_id
    if not user_id:
        user_id = 1  # 비회원 결제시 기본값 (추후 개선 필요)

    # 이미 처리된 주문인지 확인
    existing_payment = db.query(Payment).filter(
        Payment.order_id == request.order_id
    ).first()
    if existing_payment:
        return SuccessResponse(
            data=SlotPurchaseResponse(
                success=True,
                message="이미 처리된 결제입니다",
                payment_id=existing_payment.id,
                purchased_slots=request.slot_numbers,
            )
        )

    # 상품 확인
    product = db.query(Product).filter(Product.id == request.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="상품을 찾을 수 없습니다")

    # 보안: 슬롯 가격 * 슬롯 수량으로 예상 금액 계산
    slot_price = product.slot_price or product.starting_price
    expected_amount = slot_price * len(request.slot_numbers)

    # 보안: 실제 결제 금액과 예상 금액 비교
    if request.paid_amount != expected_amount:
        raise HTTPException(
            status_code=400,
            detail=f"결제 금액이 일치하지 않습니다. 예상: {expected_amount}원, 실제: {request.paid_amount}원"
        )

    # 슬롯 확인 및 잠금
    slots = db.query(ProductSlot).filter(
        ProductSlot.product_id == request.product_id,
        ProductSlot.slot_number.in_(request.slot_numbers),
    ).with_for_update().all()

    # 요청한 슬롯 수와 조회된 슬롯 수 일치 확인
    if len(slots) != len(request.slot_numbers):
        raise HTTPException(
            status_code=400,
            detail="일부 슬롯을 찾을 수 없습니다"
        )

    # 모든 슬롯이 available 상태인지 확인
    unavailable_slots = [
        s.slot_number for s in slots
        if s.status != SlotStatus.AVAILABLE.value
    ]
    if unavailable_slots:
        raise HTTPException(
            status_code=400,
            detail=f"구매할 수 없는 슬롯입니다: {unavailable_slots}"
        )

    # 결제 정보 저장
    payment = Payment(
        user_id=user_id,
        product_id=request.product_id,
        order_id=request.order_id,
        payment_key=request.payment_id,
        method=request.payment_method,
        status=PaymentStatus.COMPLETED.value,
        amount=expected_amount,  # 서버에서 계산한 금액 사용
        paid_amount=request.paid_amount,  # PortOne에서 확인된 실제 결제 금액
        pg_provider="portone",
        description=f"{product.title} - {len(request.slot_numbers)}개 슬롯",
        paid_at=datetime.now(timezone.utc),
    )
    db.add(payment)
    db.flush()  # payment.id 생성

    # 슬롯 상태 업데이트
    now = datetime.now(timezone.utc)
    for slot in slots:
        slot.buyer_id = user_id
        slot.status = SlotStatus.SOLD.value
        slot.payment_id = payment.id
        slot.paid_price = product.slot_price or product.starting_price
        slot.purchased_at = now

    # 상품의 판매된 슬롯 수 증가
    product.sold_slot_count = (product.sold_slot_count or 0) + len(slots)
    product.bid_count = (product.bid_count or 0) + 1

    # 모든 슬롯이 판매되면 상품 상태를 sold로 변경
    if product.sold_slot_count >= product.slot_count:
        product.status = "sold"

    db.commit()

    return SuccessResponse(
        data=SlotPurchaseResponse(
            success=True,
            message="결제가 완료되었습니다",
            payment_id=payment.id,
            purchased_slots=request.slot_numbers,
        )
    )


@router.get("/order/{order_id}", response_model=SuccessResponse[dict])
async def get_payment_by_order(
    order_id: str,
    db: Session = Depends(get_db),
):
    """
    주문번호로 결제 조회 (공개)
    """
    payment = db.query(Payment).filter(Payment.order_id == order_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="결제 정보를 찾을 수 없습니다")

    return SuccessResponse(
        data={
            "id": payment.id,
            "order_id": payment.order_id,
            "status": payment.status,
            "amount": float(payment.amount),
            "paid_at": payment.paid_at.isoformat() if payment.paid_at else None,
        }
    )
