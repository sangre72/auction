"""파일 업로드 서비스"""

import uuid
import aiofiles
from pathlib import Path
from datetime import datetime
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session

from boards.models import PostImage, PostAttachment
from core.config import settings


# 허용된 이미지 MIME 타입
ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
}

# 허용된 첨부파일 MIME 타입
ALLOWED_ATTACHMENT_TYPES = {
    *ALLOWED_IMAGE_TYPES,
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/zip",
    "application/x-zip-compressed",
    "application/x-rar-compressed",
    "text/plain",
    "text/csv",
}

# 파일 크기 제한
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB
MAX_ATTACHMENT_SIZE = 50 * 1024 * 1024  # 50MB


def get_upload_dir(upload_type: str = "attachment") -> Path:
    """업로드 디렉토리 경로 반환"""
    base_dir = Path(getattr(settings, 'UPLOAD_DIR', "static/uploads"))
    upload_dir = base_dir / f"{upload_type}s"
    upload_dir.mkdir(parents=True, exist_ok=True)
    return upload_dir


def generate_filename(original_filename: str) -> str:
    """고유한 파일명 생성"""
    ext = Path(original_filename).suffix.lower()
    unique_id = uuid.uuid4().hex[:12]
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return f"{timestamp}_{unique_id}{ext}"


async def save_file(file: UploadFile, upload_type: str = "attachment") -> tuple[str, int]:
    """파일을 디스크에 저장하고 (파일명, 크기) 반환"""
    upload_dir = get_upload_dir(upload_type)
    filename = generate_filename(file.filename or "file")
    file_path = upload_dir / filename

    # 파일 저장
    content = await file.read()
    file_size = len(content)

    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)

    return filename, file_size


def get_file_url(filename: str, upload_type: str) -> str:
    """파일 URL 생성 (전체 URL 반환)"""
    return f"{settings.BACKEND_URL}/static/uploads/{upload_type}s/{filename}"


async def upload_image(
    db: Session,
    file: UploadFile,
    post_id: int | None = None,
) -> dict:
    """이미지 업로드"""
    # MIME 타입 검증
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"허용되지 않는 이미지 형식입니다."
        )

    # 파일 크기 검증
    if file.size and file.size > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"이미지 크기는 {MAX_IMAGE_SIZE // (1024*1024)}MB 이하만 가능합니다."
        )

    # 파일 저장
    filename, file_size = await save_file(file, "image")
    file_url = get_file_url(filename, "image")

    # post_id가 있으면 DB에 저장
    image_id = None
    if post_id:
        image = PostImage(
            post_id=post_id,
            image_url=file_url,
            original_filename=file.filename,
            file_size=file_size,
        )
        db.add(image)
        db.commit()
        db.refresh(image)
        image_id = image.id

    return {
        "id": image_id or 0,
        "filename": filename,
        "original_filename": file.filename or "image",
        "file_size": file_size,
        "mime_type": file.content_type,
        "url": file_url,
    }


async def upload_attachment(
    db: Session,
    file: UploadFile,
    post_id: int | None = None,
) -> dict:
    """첨부파일 업로드"""
    # MIME 타입 검증
    if file.content_type not in ALLOWED_ATTACHMENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail="허용되지 않는 파일 형식입니다."
        )

    # 파일 크기 검증
    if file.size and file.size > MAX_ATTACHMENT_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"파일 크기는 {MAX_ATTACHMENT_SIZE // (1024*1024)}MB 이하만 가능합니다."
        )

    # 파일 저장
    filename, file_size = await save_file(file, "attachment")
    file_url = get_file_url(filename, "attachment")

    # 임시 첨부파일로 DB에 저장 (post_id=None 허용하려면 모델 수정 필요)
    # 현재는 post_id 없이도 임시 저장 가능하도록 처리
    attachment_id = None
    if post_id:
        attachment = PostAttachment(
            post_id=post_id,
            file_url=file_url,
            original_filename=file.filename or "file",
            file_size=file_size,
            file_type=file.content_type,
        )
        db.add(attachment)
        db.commit()
        db.refresh(attachment)
        attachment_id = attachment.id

    return {
        "id": attachment_id or 0,
        "filename": filename,
        "original_filename": file.filename or "file",
        "file_size": file_size,
        "mime_type": file.content_type,
        "url": file_url,
    }


def delete_attachment(db: Session, attachment_id: int) -> bool:
    """첨부파일 삭제"""
    attachment = db.query(PostAttachment).filter(PostAttachment.id == attachment_id).first()
    if not attachment:
        raise HTTPException(status_code=404, detail="파일을 찾을 수 없습니다.")

    # 파일 시스템에서 삭제
    filename = Path(attachment.file_url).name
    file_path = get_upload_dir("attachment") / filename
    if file_path.exists():
        file_path.unlink()

    # DB에서 삭제
    db.delete(attachment)
    db.commit()

    return True


def link_attachments_to_post(
    db: Session,
    post_id: int,
    attachment_urls: list[str],
    original_filenames: list[str],
    file_sizes: list[int],
    mime_types: list[str],
) -> list[PostAttachment]:
    """업로드된 파일들을 게시글에 연결"""
    attachments = []
    for i, url in enumerate(attachment_urls):
        attachment = PostAttachment(
            post_id=post_id,
            file_url=url,
            original_filename=original_filenames[i] if i < len(original_filenames) else "file",
            file_size=file_sizes[i] if i < len(file_sizes) else 0,
            file_type=mime_types[i] if i < len(mime_types) else None,
        )
        db.add(attachment)
        attachments.append(attachment)

    db.commit()
    return attachments


def get_post_attachments(db: Session, post_id: int) -> list[PostAttachment]:
    """게시글의 첨부파일 목록"""
    return db.query(PostAttachment).filter(PostAttachment.post_id == post_id).all()
