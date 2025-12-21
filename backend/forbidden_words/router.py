"""
금칙어 라우터 (관리자 전용)
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from core.database import get_db
from core.security import get_current_admin

from .models import ForbiddenWordTarget
from .schemas import (
    ForbiddenWordCreate,
    ForbiddenWordUpdate,
    ForbiddenWordResponse,
    ForbiddenWordListResponse,
    CheckTextRequest,
    CheckTextResponse
)
from .service import ForbiddenWordService


router = APIRouter(prefix="/forbidden-words", tags=["Forbidden Words"])


@router.get("", response_model=ForbiddenWordListResponse)
async def get_forbidden_words(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    target: Optional[ForbiddenWordTarget] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_admin)
):
    """금칙어 목록 조회"""
    service = ForbiddenWordService(db)
    skip = (page - 1) * page_size

    items, total = service.get_list(
        skip=skip,
        limit=page_size,
        search=search,
        target=target,
        is_active=is_active
    )

    return {
        "data": items,
        "meta": {
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": (total + page_size - 1) // page_size
        }
    }


@router.get("/{word_id}", response_model=ForbiddenWordResponse)
async def get_forbidden_word(
    word_id: int,
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_admin)
):
    """금칙어 상세 조회"""
    service = ForbiddenWordService(db)
    word = service.get_by_id(word_id)

    if not word:
        raise HTTPException(status_code=404, detail="금칙어를 찾을 수 없습니다.")

    return word


@router.post("", response_model=ForbiddenWordResponse, status_code=201)
async def create_forbidden_word(
    data: ForbiddenWordCreate,
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_admin)
):
    """금칙어 생성"""
    service = ForbiddenWordService(db)
    return service.create(data)


@router.patch("/{word_id}", response_model=ForbiddenWordResponse)
async def update_forbidden_word(
    word_id: int,
    data: ForbiddenWordUpdate,
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_admin)
):
    """금칙어 수정"""
    service = ForbiddenWordService(db)
    word = service.update(word_id, data)

    if not word:
        raise HTTPException(status_code=404, detail="금칙어를 찾을 수 없습니다.")

    return word


@router.delete("/{word_id}", status_code=204)
async def delete_forbidden_word(
    word_id: int,
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_admin)
):
    """금칙어 삭제"""
    service = ForbiddenWordService(db)

    if not service.delete(word_id):
        raise HTTPException(status_code=404, detail="금칙어를 찾을 수 없습니다.")

    return None


@router.post("/check", response_model=CheckTextResponse)
async def check_text(
    data: CheckTextRequest,
    db: Session = Depends(get_db),
    current_admin: dict = Depends(get_current_admin)
):
    """텍스트 금칙어 검사"""
    service = ForbiddenWordService(db)

    contains_forbidden, matched_words, filtered_text = service.check_text(
        text=data.text,
        target=data.target
    )

    return {
        "contains_forbidden": contains_forbidden,
        "matched_words": matched_words,
        "filtered_text": filtered_text
    }
