'use client';

import { useState } from 'react';
import { formatRelativeTime } from '@auction/shared';
import type { Comment } from '@/lib/api';

interface CommentItemProps {
  comment: Comment;
  boardSlug: string;
  postId: number;
  currentUserId?: number;
  onReply: (parentId: number) => void;
  onEdit: (comment: Comment) => void;
  onDelete: (commentId: number) => void;
  depth?: number;
}

export function CommentItem({
  comment,
  boardSlug,
  postId,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  depth = 0,
}: CommentItemProps) {
  const [showActions, setShowActions] = useState(false);
  const isOwner = currentUserId === comment.author?.id;
  const maxDepth = 3;

  if (comment.is_deleted) {
    return (
      <div className={`py-4 ${depth > 0 ? 'ml-8 border-l-2 border-gray-100 pl-4' : ''}`}>
        <p className="text-gray-400 italic">삭제된 댓글입니다.</p>
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                boardSlug={boardSlug}
                postId={postId}
                currentUserId={currentUserId}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                depth={Math.min(depth + 1, maxDepth)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`py-4 ${depth > 0 ? 'ml-8 border-l-2 border-gray-100 pl-4' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start gap-3">
        {/* 아바타 */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-cyan-400 flex items-center justify-center text-white font-medium flex-shrink-0">
          {comment.author?.name?.charAt(0) || '?'}
        </div>

        <div className="flex-1 min-w-0">
          {/* 작성자 정보 */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900">
              {comment.author?.name || '익명'}
            </span>
            <span className="text-sm text-gray-400">
              {formatRelativeTime(comment.created_at)}
            </span>
            {comment.updated_at !== comment.created_at && (
              <span className="text-xs text-gray-400">(수정됨)</span>
            )}
          </div>

          {/* 댓글 내용 */}
          <p className="text-gray-700 whitespace-pre-wrap break-words">
            {comment.content}
          </p>

          {/* 액션 버튼 */}
          <div className={`flex items-center gap-2 mt-2 transition-opacity ${showActions ? 'opacity-100' : 'opacity-0'}`}>
            {depth < maxDepth && (
              <button
                onClick={() => onReply(comment.id)}
                className="text-sm text-gray-500 hover:text-purple-600"
              >
                답글
              </button>
            )}
            {isOwner && (
              <>
                <button
                  onClick={() => onEdit(comment)}
                  className="text-sm text-gray-500 hover:text-purple-600"
                >
                  수정
                </button>
                <button
                  onClick={() => onDelete(comment.id)}
                  className="text-sm text-gray-500 hover:text-red-600"
                >
                  삭제
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 대댓글 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              boardSlug={boardSlug}
              postId={postId}
              currentUserId={currentUserId}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              depth={Math.min(depth + 1, maxDepth)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
