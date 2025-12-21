"""파일 업로드 스키마"""

from datetime import datetime
from pydantic import BaseModel


class UploadResponse(BaseModel):
    """업로드 응답"""
    id: int
    filename: str
    original_filename: str
    file_size: int
    mime_type: str | None
    url: str
    created_at: datetime | None = None

    class Config:
        from_attributes = True
