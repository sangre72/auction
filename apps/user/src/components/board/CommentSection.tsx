'use client';

import { useState, useEffect, useCallback } from 'react';
import { commentsApi, type Comment, type CommentCreate } from '@/lib/api';
import { CommentItem } from './CommentItem';

interface CommentSectionProps {
  boardSlug: string;
  postId: number;
  currentUserId?: number;
  onAuthRequired?: () => void;
}

export function CommentSection({
  boardSlug,
  postId,
  currentUserId,
  onAuthRequired,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await commentsApi.getByPost(boardSlug, postId);
      setComments(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
      setError('댓글을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [boardSlug, postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (editingComment) {
        await commentsApi.update(boardSlug, postId, editingComment.id, {
          content: content.trim(),
        });
        setEditingComment(null);
      } else {
        const data: CommentCreate = {
          content: content.trim(),
          parent_id: replyTo || undefined,
        };
        await commentsApi.create(boardSlug, postId, data);
        setReplyTo(null);
      }
      setContent('');
      await fetchComments();
    } catch (err) {
      const apiError = err as { status?: number };
      if (apiError?.status === 401) {
        onAuthRequired?.();
      } else {
        console.error('Failed to submit comment:', err);
        setError('댓글 작성에 실패했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = (parentId: number) => {
    setReplyTo(parentId);
    setEditingComment(null);
    setContent('');
  };

  const handleEdit = (comment: Comment) => {
    setEditingComment(comment);
    setReplyTo(null);
    setContent(comment.content);
  };

  const handleDelete = async (commentId: number) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;

    try {
      await commentsApi.delete(boardSlug, postId, commentId);
      await fetchComments();
    } catch (err) {
      console.error('Failed to delete comment:', err);
      setError('댓글 삭제에 실패했습니다.');
    }
  };

  const handleCancel = () => {
    setReplyTo(null);
    setEditingComment(null);
    setContent('');
  };

  const getPlaceholder = () => {
    if (editingComment) return '댓글을 수정하세요...';
    if (replyTo) return '답글을 입력하세요...';
    return '댓글을 입력하세요...';
  };

  // 대댓글 대상 찾기
  const findReplyTarget = (id: number): Comment | null => {
    for (const comment of comments) {
      if (comment.id === id) return comment;
      if (comment.replies) {
        for (const reply of comment.replies) {
          if (reply.id === id) return reply;
        }
      }
    }
    return null;
  };

  const replyTarget = replyTo ? findReplyTarget(replyTo) : null;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">
        댓글 {comments.length}개
      </h3>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* 댓글 입력 */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {(replyTo || editingComment) && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">
              {editingComment
                ? '댓글 수정 중'
                : `@${replyTarget?.author?.name || '알 수 없음'}에게 답글`}
            </span>
            <button
              type="button"
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              취소
            </button>
          </div>
        )}
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0">
            {currentUserId ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            ) : (
              <span>?</span>
            )}
          </div>
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={getPlaceholder()}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={!content.trim() || isSubmitting}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
              >
                {isSubmitting ? '작성 중...' : editingComment ? '수정' : '등록'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* 댓글 목록 */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          첫 번째 댓글을 작성해보세요!
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              boardSlug={boardSlug}
              postId={postId}
              currentUserId={currentUserId}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
