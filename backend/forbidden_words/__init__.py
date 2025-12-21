"""
금칙어 관리 모듈
"""

from .models import ForbiddenWord
from .router import router

__all__ = ["ForbiddenWord", "router"]
