"""
금칙어 서비스
"""

import re
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_

from .models import ForbiddenWord, ForbiddenWordType, ForbiddenWordTarget
from .schemas import ForbiddenWordCreate, ForbiddenWordUpdate


class ForbiddenWordService:
    """금칙어 관리 서비스"""

    def __init__(self, db: Session):
        self.db = db

    def get_list(
        self,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        target: Optional[ForbiddenWordTarget] = None,
        is_active: Optional[bool] = None
    ) -> Tuple[List[ForbiddenWord], int]:
        """금칙어 목록 조회"""
        query = self.db.query(ForbiddenWord)

        if search:
            query = query.filter(
                or_(
                    ForbiddenWord.word.ilike(f"%{search}%"),
                    ForbiddenWord.reason.ilike(f"%{search}%")
                )
            )

        if target:
            query = query.filter(ForbiddenWord.target == target.value)

        if is_active is not None:
            query = query.filter(ForbiddenWord.is_active == is_active)

        total = query.count()
        items = query.order_by(ForbiddenWord.created_at.desc()).offset(skip).limit(limit).all()

        return items, total

    def get_by_id(self, word_id: int) -> Optional[ForbiddenWord]:
        """금칙어 상세 조회"""
        return self.db.query(ForbiddenWord).filter(ForbiddenWord.id == word_id).first()

    def create(self, data: ForbiddenWordCreate) -> ForbiddenWord:
        """금칙어 생성"""
        forbidden_word = ForbiddenWord(
            word=data.word,
            replacement=data.replacement,
            match_type=data.match_type.value,
            target=data.target.value,
            is_active=data.is_active,
            reason=data.reason
        )
        self.db.add(forbidden_word)
        self.db.commit()
        self.db.refresh(forbidden_word)
        return forbidden_word

    def update(self, word_id: int, data: ForbiddenWordUpdate) -> Optional[ForbiddenWord]:
        """금칙어 수정"""
        forbidden_word = self.get_by_id(word_id)
        if not forbidden_word:
            return None

        update_data = data.model_dump(exclude_unset=True)

        # Enum 값 변환
        if "match_type" in update_data and update_data["match_type"]:
            update_data["match_type"] = update_data["match_type"].value
        if "target" in update_data and update_data["target"]:
            update_data["target"] = update_data["target"].value

        for key, value in update_data.items():
            setattr(forbidden_word, key, value)

        self.db.commit()
        self.db.refresh(forbidden_word)
        return forbidden_word

    def delete(self, word_id: int) -> bool:
        """금칙어 삭제"""
        forbidden_word = self.get_by_id(word_id)
        if not forbidden_word:
            return False

        self.db.delete(forbidden_word)
        self.db.commit()
        return True

    def check_text(
        self,
        text: str,
        target: Optional[ForbiddenWordTarget] = None
    ) -> Tuple[bool, List[str], str]:
        """
        텍스트에서 금칙어 검사

        Returns:
            (금칙어 포함 여부, 매칭된 금칙어 목록, 필터링된 텍스트)
        """
        # 활성화된 금칙어 조회
        query = self.db.query(ForbiddenWord).filter(ForbiddenWord.is_active == True)

        if target:
            query = query.filter(
                or_(
                    ForbiddenWord.target == ForbiddenWordTarget.ALL.value,
                    ForbiddenWord.target == target.value
                )
            )
        else:
            query = query.filter(ForbiddenWord.target == ForbiddenWordTarget.ALL.value)

        forbidden_words = query.all()

        matched_words = []
        filtered_text = text

        for fw in forbidden_words:
            is_matched = False
            replacement = fw.replacement or "***"

            if fw.match_type == ForbiddenWordType.EXACT.value:
                # 정확히 일치
                if fw.word.lower() == text.lower():
                    is_matched = True
                    filtered_text = replacement

            elif fw.match_type == ForbiddenWordType.CONTAINS.value:
                # 포함
                pattern = re.compile(re.escape(fw.word), re.IGNORECASE)
                if pattern.search(text):
                    is_matched = True
                    filtered_text = pattern.sub(replacement, filtered_text)

            elif fw.match_type == ForbiddenWordType.REGEX.value:
                # 정규식
                try:
                    pattern = re.compile(fw.word, re.IGNORECASE)
                    if pattern.search(text):
                        is_matched = True
                        filtered_text = pattern.sub(replacement, filtered_text)
                except re.error:
                    # 잘못된 정규식은 무시
                    pass

            if is_matched:
                matched_words.append(fw.word)

        return bool(matched_words), matched_words, filtered_text

    def get_active_words(self, target: Optional[ForbiddenWordTarget] = None) -> List[ForbiddenWord]:
        """활성화된 금칙어 목록 조회"""
        query = self.db.query(ForbiddenWord).filter(ForbiddenWord.is_active == True)

        if target:
            query = query.filter(
                or_(
                    ForbiddenWord.target == ForbiddenWordTarget.ALL.value,
                    ForbiddenWord.target == target.value
                )
            )

        return query.all()
