"""
배너 스키마
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class BannerCreate(BaseModel):
    """배너 생성"""

    title: str
    description: Optional[str] = None
    position: str = "main_top"
    type: str = "image"
    image_url: Optional[str] = None
    mobile_image_url: Optional[str] = None
    alt_text: Optional[str] = None
    video_url: Optional[str] = None
    html_content: Optional[str] = None
    link_url: Optional[str] = None
    link_target: str = "_blank"  # 새 창에서 열기 기본값
    is_active: bool = True
    sort_order: int = 0
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class BannerUpdate(BaseModel):
    """배너 수정"""

    title: Optional[str] = None
    description: Optional[str] = None
    position: Optional[str] = None
    type: Optional[str] = None
    image_url: Optional[str] = None
    mobile_image_url: Optional[str] = None
    alt_text: Optional[str] = None
    video_url: Optional[str] = None
    html_content: Optional[str] = None
    link_url: Optional[str] = None
    link_target: Optional[str] = None
    is_active: Optional[bool] = None
    sort_order: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class BannerResponse(BaseModel):
    """배너 응답"""

    id: int
    title: str
    description: Optional[str] = None
    position: str
    type: str
    image_url: Optional[str] = None
    mobile_image_url: Optional[str] = None
    alt_text: Optional[str] = None
    video_url: Optional[str] = None
    html_content: Optional[str] = None
    link_url: Optional[str] = None
    link_target: str
    is_active: bool
    sort_order: int
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    view_count: int
    click_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BannerListResponse(BaseModel):
    """배너 목록 응답"""

    id: int
    title: str
    position: str
    type: str
    is_active: bool
    sort_order: int
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    view_count: int
    click_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class BannerSearchParams(BaseModel):
    """배너 검색 파라미터"""

    title: Optional[str] = None
    position: Optional[str] = None
    type: Optional[str] = None
    is_active: Optional[bool] = None


class BannerPublicResponse(BaseModel):
    """배너 공개 응답 (사용자용)"""

    id: int
    title: str
    description: Optional[str] = None
    position: str
    type: str
    image_url: Optional[str] = None
    mobile_image_url: Optional[str] = None
    alt_text: Optional[str] = None
    html_content: Optional[str] = None
    link_url: Optional[str] = None
    link_target: str
    sort_order: int

    class Config:
        from_attributes = True
