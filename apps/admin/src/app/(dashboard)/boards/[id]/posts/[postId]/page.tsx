'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { formatDate } from '@auction/shared';
import { Button, Badge, Card, Alert } from '@/components/ui';
import { boardsApi, postsApi, type Post as ApiPost, type Board as ApiBoard } from '@/lib/api';
import { PostForm } from '@/features/boards';
import type { Board, Post, PostFormData } from '@/features/boards';

type ViewMode = 'view' | 'edit';

const statusBadgeVariant: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  published: 'success',
  hidden: 'warning',
  deleted: 'danger',
  draft: 'default',
};

const statusLabel: Record<string, string> = {
  published: '게시됨',
  hidden: '숨김',
  deleted: '삭제됨',
  draft: '임시저장',
};

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const boardId = parseInt(params.id as string, 10);
  const postId = parseInt(params.postId as string, 10);

  const [board, setBoard] = useState<Board | null>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<ViewMode>('view');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [boardRes, postRes] = await Promise.all([
        boardsApi.getById(boardId),
        postsApi.getById(postId),
      ]);

      setBoard(boardRes.data as unknown as Board);
      setPost(postRes.data as unknown as Post);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [boardId, postId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (formData: PostFormData) => {
    await postsApi.update(postId, {
      title: formData.title,
      content: formData.content,
      status: formData.status,
      is_pinned: formData.is_pinned,
      is_notice: formData.is_notice,
    });
    await fetchData();
    setMode('view');
  };

  const handleDelete = async () => {
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) return;

    try {
      await postsApi.delete(postId);
      router.push(`/boards/${boardId}/posts`);
    } catch (err) {
      console.error('Failed to delete post:', err);
      setError('게시글 삭제에 실패했습니다.');
    }
  };

  const handleRestore = async () => {
    try {
      await postsApi.restore(postId);
      await fetchData();
    } catch (err) {
      console.error('Failed to restore post:', err);
      setError('게시글 복원에 실패했습니다.');
    }
  };

  const handleToggleNotice = async () => {
    try {
      await postsApi.setNotice(postId, !post?.is_notice);
      await fetchData();
    } catch (err) {
      console.error('Failed to toggle notice:', err);
      setError('공지 설정에 실패했습니다.');
    }
  };

  const handleTogglePinned = async () => {
    try {
      await postsApi.setPinned(postId, !post?.is_pinned);
      await fetchData();
    } catch (err) {
      console.error('Failed to toggle pinned:', err);
      setError('고정 설정에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (!post || !board) {
    return (
      <Alert variant="danger" title="오류">
        게시글을 찾을 수 없습니다.
      </Alert>
    );
  }

  // 수정 모드
  if (mode === 'edit') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">게시글 수정</h1>
          <p className="text-gray-400 mt-1">{board.title} 게시판</p>
        </div>

        <PostForm
          board={board}
          post={post}
          onSubmit={handleSubmit}
          onCancel={() => setMode('view')}
        />
      </div>
    );
  }

  // 보기 모드
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white">게시글 상세</h1>
            <Badge variant={statusBadgeVariant[post.status] || 'default'}>
              {statusLabel[post.status] || post.status}
            </Badge>
            {post.is_notice && <Badge variant="info">공지</Badge>}
            {post.is_pinned && <Badge variant="warning">고정</Badge>}
          </div>
          <p className="text-gray-400">{board.title} 게시판</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setMode('edit')}>
            수정
          </Button>
          <Button variant="outline" onClick={() => router.push(`/boards/${boardId}/posts`)}>
            목록으로
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" title="오류" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 게시글 정보 */}
      <Card className="p-6 space-y-4">
        {/* 보기 모드 */}
        <div className="border-b border-white/10 pb-4">
          <h2 className="text-xl font-semibold text-white mb-2">{post.title}</h2>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>작성자: {post.author?.name || '(알 수 없음)'}</span>
            <span>작성일: {formatDate(post.created_at, { includeTime: true })}</span>
            {post.updated_at !== post.created_at && (
              <span>수정일: {formatDate(post.updated_at, { includeTime: true })}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm text-gray-400 py-2">
          <span className="flex items-center gap-1">
            <EyeIcon className="w-4 h-4" /> 조회 {post.view_count}
          </span>
          <span className="flex items-center gap-1">
            <HeartIcon className="w-4 h-4 text-pink-500" /> 좋아요 {post.like_count}
          </span>
          <span className="flex items-center gap-1">
            <ChatIcon className="w-4 h-4" /> 댓글 {post.comment_count}
          </span>
        </div>

        <div className="prose prose-invert max-w-none py-4">
          <div
            className="text-gray-300"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </Card>

      {/* 관리 옵션 */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">관리 옵션</h2>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handleToggleNotice}>
            {post.is_notice ? '공지 해제' : '공지 설정'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleTogglePinned}>
            {post.is_pinned ? '고정 해제' : '상단 고정'}
          </Button>
          {post.status === 'deleted' ? (
            <Button
              variant="outline"
              size="sm"
              className="text-emerald-400 border-emerald-400 hover:bg-emerald-400/10"
              onClick={handleRestore}
            >
              복원
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="text-red-400 border-red-400 hover:bg-red-400/10"
              onClick={handleDelete}
            >
              삭제
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

// 아이콘 컴포넌트들
function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}
