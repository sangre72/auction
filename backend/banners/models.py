"""
배너 모델
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
import enum

from core.database import Base


class BannerPosition(str, enum.Enum):
    """배너 위치"""

    MAIN_TOP = "main_top"  # 메인 상단
    MAIN_MIDDLE = "main_middle"  # 메인 중간
    SIDEBAR = "sidebar"  # 사이드바
    POPUP = "popup"  # 팝업
    FOOTER = "footer"  # 푸터


class BannerType(str, enum.Enum):
    """배너 타입"""

    IMAGE = "image"  # 이미지
    VIDEO = "video"  # 비디오
    HTML = "html"  # HTML


class Banner(Base):
    """배너 테이블"""

    __tablename__ = "banners"

    id = Column(Integer, primary_key=True, index=True)

    # 기본 정보
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    position = Column(String(30), default=BannerPosition.MAIN_TOP.value)
    type = Column(String(20), default=BannerType.IMAGE.value)

    # 미디어
    image_url = Column(String(500), nullable=True)
    mobile_image_url = Column(String(500), nullable=True)
    alt_text = Column(String(255), nullable=True)  # 이미지 대체 텍스트
    video_url = Column(String(500), nullable=True)
    html_content = Column(Text, nullable=True)

    # 링크
    link_url = Column(String(500), nullable=True)
    link_target = Column(String(20), default="_self")  # _self, _blank

    # 표시 설정
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)

    # 표시 기간
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)

    # 통계
    view_count = Column(Integer, default=0)
    click_count = Column(Integer, default=0)

    # 타임스탬프
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
