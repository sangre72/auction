"""
게시판 플러그인 설정

다른 프로젝트에서 재정의하여 사용 가능한 게시판 설정 클래스
User 모델과 파일 업로드 설정을 주입받아 사용합니다.

Example:
    # 기본 설정 사용
    from boards.config import boards_plugin_config

    # 커스텀 설정
    custom_config = BoardsPluginConfig(
        max_file_size=20 * 1024 * 1024,
        upload_dir="./my_uploads",
    )
"""

from pydantic_settings import BaseSettings
from typing import Optional
from functools import lru_cache


class BoardsPluginConfig(BaseSettings):
    """
    게시판 플러그인 설정

    다른 프로젝트에서 이 클래스를 상속하거나 인스턴스를 생성하여
    게시판 동작을 커스터마이징할 수 있습니다.
    """

    # ========================================
    # 파일 업로드 설정
    # ========================================

    # 최대 파일 크기 (바이트)
    max_file_size: int = 10 * 1024 * 1024  # 10MB

    # 허용된 이미지 확장자
    allowed_image_extensions: list[str] = [".jpg", ".jpeg", ".png", ".gif", ".webp"]

    # 허용된 첨부파일 확장자
    allowed_attachment_extensions: list[str] = [
        ".jpg", ".jpeg", ".png", ".gif", ".webp",
        ".pdf", ".doc", ".docx", ".xls", ".xlsx",
        ".hwp", ".txt", ".zip", ".rar",
    ]

    # 최대 이미지 파일 크기
    max_image_size: int = 5 * 1024 * 1024  # 5MB

    # 최대 첨부파일 개수
    max_attachments: int = 10

    # 업로드 디렉토리
    upload_dir: str = "./uploads"

    # 이미지 저장 경로
    image_upload_path: str = "boards/images"

    # 첨부파일 저장 경로
    attachment_upload_path: str = "boards/attachments"

    # ========================================
    # 게시판 기본값 설정
    # ========================================

    # 기본 읽기 권한
    default_read_permission: str = "public"

    # 기본 쓰기 권한
    default_write_permission: str = "login"

    # 기본 댓글 권한
    default_comment_permission: str = "login"

    # ========================================
    # 페이지네이션 설정
    # ========================================

    # 기본 페이지 크기
    default_page_size: int = 20

    # 최대 페이지 크기
    max_page_size: int = 100

    # ========================================
    # 콘텐츠 설정
    # ========================================

    # 제목 최대 길이
    max_title_length: int = 300

    # 내용 최대 길이
    max_content_length: int = 100000  # 100KB

    # 댓글 최대 길이
    max_comment_length: int = 2000

    # ========================================
    # 기능 토글
    # ========================================

    # 좋아요 기능 활성화
    enable_likes: bool = True

    # 댓글 기능 활성화
    enable_comments: bool = True

    # 첨부파일 기능 활성화
    enable_attachments: bool = True

    # 이미지 업로드 기능 활성화
    enable_images: bool = True

    class Config:
        env_prefix = "BOARDS_"
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"


@lru_cache()
def get_boards_plugin_config() -> BoardsPluginConfig:
    """게시판 플러그인 설정 인스턴스 반환 (캐시됨)"""
    return BoardsPluginConfig()


# 기본 인스턴스 (대부분의 경우 이것을 사용)
boards_plugin_config = get_boards_plugin_config()
