"""
마이페이지 라우터 (현재 로그인 사용자용)
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from core.database import get_db
from core.security import get_current_user
from common.responses import SuccessResponse, PaginatedResponse, PaginationMeta
from payments.models import Payment
from products.models import Product, ProductSlot

router = APIRouter(prefix="/users/me", tags=["마이페이지"])


# ============ Schemas ============

class PaymentItem(BaseModel):
    """결제 내역 아이템"""
    id: int
    order_id: str
    amount: float
    paid_amount: float
    method: str
    status: str
    description: Optional[str] = None
    paid_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class PurchaseSlotItem(BaseModel):
    """구매 슬롯 아이템"""
    slot_number: int
    paid_price: float
    purchased_at: Optional[datetime] = None


class PurchaseItem(BaseModel):
    """구매 내역 아이템"""
    payment_id: int
    order_id: str
    product_id: int
    product_title: str
    product_thumbnail: Optional[str] = None
    slots: List[PurchaseSlotItem]
    total_amount: float
    payment_method: str
    payment_status: str
    purchased_at: Optional[datetime] = None


# ============ Endpoints ============

@router.get("/payments", response_model=PaginatedResponse[PaymentItem])
async def get_my_payments(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    내 결제 내역 조회
    """
    user_id = current_user["id"]

    query = db.query(Payment).filter(Payment.user_id == user_id)

    if status:
        query = query.filter(Payment.status == status)

    # 총 개수
    total_count = query.count()

    # 페이지네이션
    offset = (page - 1) * page_size
    payments = query.order_by(desc(Payment.created_at)).offset(offset).limit(page_size).all()

    total_pages = (total_count + page_size - 1) // page_size

    items = [
        PaymentItem(
            id=p.id,
            order_id=p.order_id,
            amount=float(p.amount),
            paid_amount=float(p.paid_amount) if p.paid_amount else 0,
            method=p.method,
            status=p.status,
            description=p.description,
            paid_at=p.paid_at,
            created_at=p.created_at,
        )
        for p in payments
    ]

    return PaginatedResponse(
        data=items,
        meta=PaginationMeta(
            page=page,
            page_size=page_size,
            total_count=total_count,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_prev=page > 1,
        ),
    )


@router.get("/purchases", response_model=PaginatedResponse[PurchaseItem])
async def get_my_purchases(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    내 구매 내역 조회 (상품 정보 + 슬롯 정보 + 결제 정보)
    """
    user_id = current_user["id"]

    # 내가 구매한 슬롯들 (payment_id로 그룹핑)
    slots = db.query(ProductSlot).filter(
        ProductSlot.buyer_id == user_id,
        ProductSlot.status == "sold",
        ProductSlot.payment_id.isnot(None),
    ).order_by(desc(ProductSlot.purchased_at)).all()

    # payment_id로 그룹핑
    payment_groups = {}
    for slot in slots:
        if slot.payment_id not in payment_groups:
            payment_groups[slot.payment_id] = []
        payment_groups[slot.payment_id].append(slot)

    # 결제 정보와 상품 정보 조회
    purchases = []
    for payment_id, slot_list in payment_groups.items():
        payment = db.query(Payment).filter(Payment.id == payment_id).first()
        if not payment:
            continue

        product = db.query(Product).filter(Product.id == payment.product_id).first()
        if not product:
            continue

        purchases.append({
            "payment": payment,
            "product": product,
            "slots": slot_list,
        })

    # 구매일 기준 정렬
    purchases.sort(key=lambda x: x["payment"].paid_at or x["payment"].created_at, reverse=True)

    # 페이지네이션
    total_count = len(purchases)
    total_pages = (total_count + page_size - 1) // page_size if total_count > 0 else 1
    offset = (page - 1) * page_size
    paginated_purchases = purchases[offset:offset + page_size]

    items = [
        PurchaseItem(
            payment_id=p["payment"].id,
            order_id=p["payment"].order_id,
            product_id=p["product"].id,
            product_title=p["product"].title,
            product_thumbnail=p["product"].thumbnail_url,
            slots=[
                PurchaseSlotItem(
                    slot_number=s.slot_number,
                    paid_price=float(s.paid_price) if s.paid_price else 0,
                    purchased_at=s.purchased_at,
                )
                for s in sorted(p["slots"], key=lambda x: x.slot_number)
            ],
            total_amount=float(p["payment"].paid_amount) if p["payment"].paid_amount else 0,
            payment_method=p["payment"].method,
            payment_status=p["payment"].status,
            purchased_at=p["payment"].paid_at,
        )
        for p in paginated_purchases
    ]

    return PaginatedResponse(
        data=items,
        meta=PaginationMeta(
            page=page,
            page_size=page_size,
            total_count=total_count,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_prev=page > 1,
        ),
    )


@router.get("/purchases/summary", response_model=SuccessResponse[dict])
async def get_my_purchases_summary(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    내 구매 요약 (총 구매 건수, 총 금액)
    """
    user_id = current_user["id"]

    # 완료된 결제 내역
    payments = db.query(Payment).filter(
        Payment.user_id == user_id,
        Payment.status == "completed",
    ).all()

    total_count = len(payments)
    total_amount = sum(float(p.paid_amount) for p in payments if p.paid_amount)

    return SuccessResponse(
        data={
            "total_count": total_count,
            "total_amount": total_amount,
        }
    )
