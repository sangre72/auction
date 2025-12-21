"""파일 업로드 라우터"""

from typing import Any, Optional
from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import get_current_user, get_current_user_optional

from .service import (
    upload_image,
    upload_attachment,
    delete_attachment,
)
from .schemas import UploadResponse

router = APIRouter(prefix="/uploads", tags=["uploads"])


@router.post("/images", response_model=UploadResponse)
async def upload_image_endpoint(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Optional[dict[str, Any]] = Depends(get_current_user_optional),
):
    """이미지 업로드 (에디터용)"""
    result = await upload_image(db=db, file=file)
    return UploadResponse(**result, created_at=None)


@router.post("/attachments", response_model=UploadResponse)
async def upload_attachment_endpoint(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Optional[dict[str, Any]] = Depends(get_current_user_optional),
):
    """첨부파일 업로드"""
    result = await upload_attachment(db=db, file=file)
    return UploadResponse(**result, created_at=None)


@router.delete("/attachments/{attachment_id}")
async def delete_attachment_endpoint(
    attachment_id: int,
    db: Session = Depends(get_db),
    current_user: dict[str, Any] = Depends(get_current_user),
):
    """첨부파일 삭제"""
    delete_attachment(db=db, attachment_id=attachment_id)
    return {"success": True}
