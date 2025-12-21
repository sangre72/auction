"""
게시판 서비스
"""

from typing import Optional, List
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session

from common.errors import NotFoundException, BadRequestException, ForbiddenException
from common.pagination import Pagination, PaginationParams
from .models import (
    Board, Post, PostImage, PostAttachment, Comment, PostLike,
    ReadPermission, WritePermission, CommentPermission, PostStatus
)
from .schemas import (
    BoardCreate, BoardUpdate, BoardResponse, BoardListResponse, BoardStats,
    PostCreate, PostUpdate, PostResponse, PostListResponse, PostSearchParams,
    CommentCreate, CommentUpdate, CommentResponse,
    AuthorResponse, PostImageResponse, PostAttachmentResponse,
    LikeToggleResponse
)
from users.models import User


class BoardService:
    """게시판 서비스"""

    def __init__(self, db: Session):
        self.db = db

    # ============================================
    # Board CRUD
    # ============================================

    def create_board(self, data: BoardCreate) -> BoardResponse:
        """게시판 생성"""
        existing = self.db.query(Board).filter(Board.name == data.name).first()
        if existing:
            raise BadRequestException(detail="이미 존재하는 게시판 이름입니다")

        board = Board(**data.model_dump())
        self.db.add(board)
        self.db.commit()
        self.db.refresh(board)

        return BoardResponse.model_validate(board)

    def get_board(self, board_id: int) -> BoardResponse:
        """게시판 상세 조회"""
        board = self.db.query(Board).filter(Board.id == board_id).first()
        if not board:
            raise NotFoundException(detail="게시판을 찾을 수 없습니다")
        return BoardResponse.model_validate(board)

    def get_board_by_name(self, name: str) -> Board:
        """게시판명으로 조회 (모델 반환)"""
        board = self.db.query(Board).filter(Board.name == name).first()
        if not board:
            raise NotFoundException(detail="게시판을 찾을 수 없습니다")
        return board

    def get_board_list(
        self,
        pagination: PaginationParams,
        is_active: Optional[bool] = None,
    ) -> Pagination[BoardListResponse]:
        """게시판 목록 조회"""
        query = self.db.query(Board)

        if is_active is not None:
            query = query.filter(Board.is_active == is_active)

        query = query.order_by(Board.sort_order.asc(), Board.created_at.desc())

        result = Pagination.from_query(query, pagination)

        items = []
        for board in result.items:
            post_count = self.db.query(Post).filter(
                Post.board_id == board.id,
                Post.status == PostStatus.PUBLISHED.value
            ).count()

            items.append(BoardListResponse(
                id=board.id,
                name=board.name,
                title=board.title,
                description=board.description,
                is_active=board.is_active,
                sort_order=board.sort_order,
                post_count=post_count,
            ))

        return Pagination(
            items=items,
            total_count=result.total_count,
            page=result.page,
            page_size=result.page_size,
        )

    def get_board_stats(self) -> BoardStats:
        """게시판 통계"""
        total = self.db.query(Board).count()
        active = self.db.query(Board).filter(Board.is_active == True).count()
        inactive = total - active
        total_posts = self.db.query(Post).filter(
            Post.status == PostStatus.PUBLISHED.value
        ).count()

        today = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        today_posts = self.db.query(Post).filter(
            Post.status == PostStatus.PUBLISHED.value,
            Post.created_at >= today
        ).count()

        return BoardStats(
            total=total,
            active=active,
            inactive=inactive,
            total_posts=total_posts,
            today_posts=today_posts,
        )

    def update_board(self, board_id: int, data: BoardUpdate) -> BoardResponse:
        """게시판 수정"""
        board = self.db.query(Board).filter(Board.id == board_id).first()
        if not board:
            raise NotFoundException(detail="게시판을 찾을 수 없습니다")

        update_data = data.model_dump(exclude_unset=True)

        if "name" in update_data and update_data["name"] != board.name:
            existing = self.db.query(Board).filter(Board.name == update_data["name"]).first()
            if existing:
                raise BadRequestException(detail="이미 존재하는 게시판 이름입니다")

        for field, value in update_data.items():
            setattr(board, field, value)

        self.db.commit()
        self.db.refresh(board)

        return BoardResponse.model_validate(board)

    def delete_board(self, board_id: int) -> bool:
        """게시판 삭제"""
        board = self.db.query(Board).filter(Board.id == board_id).first()
        if not board:
            raise NotFoundException(detail="게시판을 찾을 수 없습니다")

        self.db.delete(board)
        self.db.commit()
        return True

    def reorder_boards(self, board_ids: List[int]) -> bool:
        """게시판 순서 변경"""
        for index, board_id in enumerate(board_ids):
            board = self.db.query(Board).filter(Board.id == board_id).first()
            if board:
                board.sort_order = index
        self.db.commit()
        return True

    # ============================================
    # 권한 체크 헬퍼
    # ============================================

    def check_read_permission(
        self,
        board: Board,
        current_user: Optional[dict],
        is_admin: bool = False,
    ) -> bool:
        """읽기 권한 체크"""
        if is_admin:
            return True

        if board.read_permission == ReadPermission.PUBLIC.value:
            return True
        elif board.read_permission == ReadPermission.LOGIN.value:
            return current_user is not None
        elif board.read_permission == ReadPermission.ADMIN.value:
            return is_admin

        return False

    def check_write_permission(
        self,
        board: Board,
        current_user: Optional[dict],
        is_admin: bool = False,
    ) -> bool:
        """쓰기 권한 체크"""
        if is_admin:
            return True

        if board.write_permission == WritePermission.LOGIN.value:
            return current_user is not None
        elif board.write_permission == WritePermission.ADMIN.value:
            return is_admin

        return False

    def check_comment_permission(
        self,
        board: Board,
        current_user: Optional[dict],
        is_admin: bool = False,
    ) -> bool:
        """댓글 권한 체크"""
        if is_admin:
            return True

        if board.comment_permission == CommentPermission.DISABLED.value:
            return False
        elif board.comment_permission == CommentPermission.LOGIN.value:
            return current_user is not None

        return False

    # ============================================
    # Post CRUD
    # ============================================

    def create_post(
        self,
        data: PostCreate,
        author_id: int,
        is_admin: bool = False,
    ) -> PostResponse:
        """게시글 생성"""
        board = self.db.query(Board).filter(Board.id == data.board_id).first()
        if not board:
            raise NotFoundException(detail="게시판을 찾을 수 없습니다")

        if not board.is_active and not is_admin:
            raise BadRequestException(detail="비활성화된 게시판입니다")

        post = Post(
            board_id=data.board_id,
            author_id=author_id,
            title=data.title,
            content=data.content,
            is_pinned=data.is_pinned if is_admin else False,
            is_notice=data.is_notice if is_admin else False,
            status=PostStatus.PUBLISHED.value,
        )
        self.db.add(post)
        self.db.flush()

        if data.image_urls:
            for idx, url in enumerate(data.image_urls):
                image = PostImage(
                    post_id=post.id,
                    image_url=url,
                    sort_order=idx,
                )
                self.db.add(image)

        self.db.commit()
        self.db.refresh(post)

        return self._build_post_response(post)

    def get_post(
        self,
        post_id: int,
        current_user: Optional[dict] = None,
        increment_view: bool = True,
    ) -> PostResponse:
        """게시글 상세 조회"""
        post = self.db.query(Post).filter(Post.id == post_id).first()
        if not post:
            raise NotFoundException(detail="게시글을 찾을 수 없습니다")

        if increment_view:
            post.view_count += 1
            self.db.commit()

        return self._build_post_response(post, current_user)

    def get_post_list(
        self,
        board_id: int,
        pagination: PaginationParams,
        search: Optional[PostSearchParams] = None,
        include_hidden: bool = False,
    ) -> Pagination[PostListResponse]:
        """게시글 목록 조회"""
        query = self.db.query(Post).filter(Post.board_id == board_id)

        if not include_hidden:
            query = query.filter(Post.status == PostStatus.PUBLISHED.value)

        if search:
            if search.title:
                query = query.filter(Post.title.ilike(f"%{search.title}%"))
            if search.content:
                query = query.filter(Post.content.ilike(f"%{search.content}%"))
            if search.status:
                query = query.filter(Post.status == search.status)
            if search.is_pinned is not None:
                query = query.filter(Post.is_pinned == search.is_pinned)
            if search.is_notice is not None:
                query = query.filter(Post.is_notice == search.is_notice)

        query = query.order_by(
            Post.is_pinned.desc(),
            Post.is_notice.desc(),
            Post.created_at.desc()
        )

        result = Pagination.from_query(query, pagination)

        items = []
        for post in result.items:
            author = self.db.query(User).filter(User.id == post.author_id).first() if post.author_id else None
            has_images = self.db.query(PostImage).filter(PostImage.post_id == post.id).count() > 0
            has_attachments = self.db.query(PostAttachment).filter(PostAttachment.post_id == post.id).count() > 0

            items.append(PostListResponse(
                id=post.id,
                board_id=post.board_id,
                author_name=author.name if author else None,
                title=post.title,
                status=post.status,
                is_pinned=post.is_pinned,
                is_notice=post.is_notice,
                view_count=post.view_count,
                like_count=post.like_count,
                comment_count=post.comment_count,
                has_images=has_images,
                has_attachments=has_attachments,
                created_at=post.created_at,
            ))

        return Pagination(
            items=items,
            total_count=result.total_count,
            page=result.page,
            page_size=result.page_size,
        )

    def update_post(
        self,
        post_id: int,
        data: PostUpdate,
        current_user: dict,
        is_admin: bool = False,
    ) -> PostResponse:
        """게시글 수정"""
        post = self.db.query(Post).filter(Post.id == post_id).first()
        if not post:
            raise NotFoundException(detail="게시글을 찾을 수 없습니다")

        if not is_admin and post.author_id != current_user.get("id"):
            raise ForbiddenException(detail="수정 권한이 없습니다")

        update_data = data.model_dump(exclude_unset=True)

        if not is_admin:
            update_data.pop("is_pinned", None)
            update_data.pop("is_notice", None)
            update_data.pop("status", None)

        for field, value in update_data.items():
            setattr(post, field, value)

        self.db.commit()
        self.db.refresh(post)

        return self._build_post_response(post, current_user)

    def delete_post(
        self,
        post_id: int,
        current_user: dict,
        is_admin: bool = False,
    ) -> bool:
        """게시글 삭제 (소프트 삭제)"""
        post = self.db.query(Post).filter(Post.id == post_id).first()
        if not post:
            raise NotFoundException(detail="게시글을 찾을 수 없습니다")

        if not is_admin and post.author_id != current_user.get("id"):
            raise ForbiddenException(detail="삭제 권한이 없습니다")

        post.status = PostStatus.DELETED.value
        self.db.commit()

        return True

    def set_post_notice(self, post_id: int, is_notice: bool) -> PostResponse:
        """게시글 공지 설정"""
        post = self.db.query(Post).filter(Post.id == post_id).first()
        if not post:
            raise NotFoundException(detail="게시글을 찾을 수 없습니다")

        post.is_notice = is_notice
        self.db.commit()
        self.db.refresh(post)

        return self._build_post_response(post)

    def _build_post_response(
        self,
        post: Post,
        current_user: Optional[dict] = None,
    ) -> PostResponse:
        """게시글 응답 빌드"""
        board = self.db.query(Board).filter(Board.id == post.board_id).first()
        author = self.db.query(User).filter(User.id == post.author_id).first() if post.author_id else None
        images = self.db.query(PostImage).filter(PostImage.post_id == post.id).order_by(PostImage.sort_order).all()
        attachments = self.db.query(PostAttachment).filter(PostAttachment.post_id == post.id).all()

        is_liked = False
        if current_user:
            like = self.db.query(PostLike).filter(
                PostLike.post_id == post.id,
                PostLike.user_id == current_user.get("id"),
            ).first()
            is_liked = like is not None

        return PostResponse(
            id=post.id,
            board_id=post.board_id,
            board_name=board.name if board else "",
            board_title=board.title if board else "",
            author=AuthorResponse(
                id=author.id,
                name=author.name,
                nickname=author.nickname,
                profile_image=author.profile_image,
            ) if author else None,
            title=post.title,
            content=post.content,
            status=post.status,
            is_pinned=post.is_pinned,
            is_notice=post.is_notice,
            view_count=post.view_count,
            like_count=post.like_count,
            comment_count=post.comment_count,
            images=[PostImageResponse.model_validate(img) for img in images],
            attachments=[PostAttachmentResponse.model_validate(att) for att in attachments],
            is_liked=is_liked,
            created_at=post.created_at,
            updated_at=post.updated_at,
        )

    # ============================================
    # Comment CRUD
    # ============================================

    def create_comment(
        self,
        post_id: int,
        data: CommentCreate,
        author_id: int,
    ) -> CommentResponse:
        """댓글 생성"""
        post = self.db.query(Post).filter(Post.id == post_id).first()
        if not post:
            raise NotFoundException(detail="게시글을 찾을 수 없습니다")

        if data.parent_id:
            parent = self.db.query(Comment).filter(
                Comment.id == data.parent_id,
                Comment.post_id == post_id,
            ).first()
            if not parent:
                raise NotFoundException(detail="부모 댓글을 찾을 수 없습니다")

        comment = Comment(
            post_id=post_id,
            author_id=author_id,
            parent_id=data.parent_id,
            content=data.content,
        )
        self.db.add(comment)

        post.comment_count += 1

        self.db.commit()
        self.db.refresh(comment)

        return self._build_comment_response(comment)

    def get_comments(self, post_id: int) -> List[CommentResponse]:
        """게시글 댓글 목록 조회 (트리 구조)"""
        comments = self.db.query(Comment).filter(
            Comment.post_id == post_id,
            Comment.parent_id.is_(None),
        ).order_by(Comment.created_at.asc()).all()

        return [self._build_comment_response(c, include_replies=True) for c in comments]

    def update_comment(
        self,
        comment_id: int,
        data: CommentUpdate,
        current_user: dict,
        is_admin: bool = False,
    ) -> CommentResponse:
        """댓글 수정"""
        comment = self.db.query(Comment).filter(Comment.id == comment_id).first()
        if not comment:
            raise NotFoundException(detail="댓글을 찾을 수 없습니다")

        if not is_admin and comment.author_id != current_user.get("id"):
            raise ForbiddenException(detail="수정 권한이 없습니다")

        comment.content = data.content
        self.db.commit()
        self.db.refresh(comment)

        return self._build_comment_response(comment)

    def delete_comment(
        self,
        comment_id: int,
        current_user: dict,
        is_admin: bool = False,
    ) -> bool:
        """댓글 삭제 (소프트 삭제)"""
        comment = self.db.query(Comment).filter(Comment.id == comment_id).first()
        if not comment:
            raise NotFoundException(detail="댓글을 찾을 수 없습니다")

        if not is_admin and comment.author_id != current_user.get("id"):
            raise ForbiddenException(detail="삭제 권한이 없습니다")

        comment.is_deleted = True
        comment.content = "삭제된 댓글입니다."

        post = self.db.query(Post).filter(Post.id == comment.post_id).first()
        if post and post.comment_count > 0:
            post.comment_count -= 1

        self.db.commit()

        return True

    def _build_comment_response(
        self,
        comment: Comment,
        include_replies: bool = False,
    ) -> CommentResponse:
        """댓글 응답 빌드"""
        author = self.db.query(User).filter(User.id == comment.author_id).first() if comment.author_id else None

        replies = []
        if include_replies:
            reply_comments = self.db.query(Comment).filter(
                Comment.parent_id == comment.id
            ).order_by(Comment.created_at.asc()).all()
            replies = [self._build_comment_response(r, include_replies=True) for r in reply_comments]

        return CommentResponse(
            id=comment.id,
            post_id=comment.post_id,
            author=AuthorResponse(
                id=author.id,
                name=author.name,
                nickname=author.nickname,
                profile_image=author.profile_image,
            ) if author else None,
            parent_id=comment.parent_id,
            content=comment.content,
            is_deleted=comment.is_deleted,
            replies=replies,
            created_at=comment.created_at,
            updated_at=comment.updated_at,
        )

    # ============================================
    # Like
    # ============================================

    def toggle_like(self, post_id: int, user_id: int) -> LikeToggleResponse:
        """좋아요 토글"""
        post = self.db.query(Post).filter(Post.id == post_id).first()
        if not post:
            raise NotFoundException(detail="게시글을 찾을 수 없습니다")

        existing = self.db.query(PostLike).filter(
            PostLike.post_id == post_id,
            PostLike.user_id == user_id,
        ).first()

        if existing:
            self.db.delete(existing)
            post.like_count = max(0, post.like_count - 1)
            self.db.commit()
            return LikeToggleResponse(
                is_liked=False,
                like_count=post.like_count,
                message="좋아요를 취소했습니다",
            )
        else:
            like = PostLike(post_id=post_id, user_id=user_id)
            self.db.add(like)
            post.like_count += 1
            self.db.commit()
            return LikeToggleResponse(
                is_liked=True,
                like_count=post.like_count,
                message="좋아요를 눌렀습니다",
            )

    def check_like_status(self, post_id: int, user_id: int) -> bool:
        """좋아요 여부 확인"""
        like = self.db.query(PostLike).filter(
            PostLike.post_id == post_id,
            PostLike.user_id == user_id,
        ).first()
        return like is not None
