'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Alert } from '@/components/ui';
import { boardsApi, postsApi } from '@/lib/api';
import { PostForm } from '@/features/boards';
import type { Board, PostFormData } from '@/features/boards';

export default function NewPostPage() {
  const router = useRouter();
  const params = useParams();
  const boardId = parseInt(params.id as string, 10);

  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBoard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await boardsApi.getById(boardId);
      setBoard(res.data as unknown as Board);
    } catch (err) {
      console.error('Failed to fetch board:', err);
      setError('게시판 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  const handleSubmit = async (formData: PostFormData) => {
    await postsApi.create(boardId, {
      title: formData.title,
      content: formData.content,
      is_pinned: formData.is_pinned,
      is_notice: formData.is_notice,
    });
    router.push(`/boards/${boardId}/posts`);
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (error || !board) {
    return (
      <Alert variant="danger" title="오류">
        {error || '게시판을 찾을 수 없습니다.'}
      </Alert>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-white">게시글 작성</h1>
        <p className="text-gray-400 mt-1">{board.title} 게시판에 새 글을 작성합니다.</p>
      </div>

      <PostForm board={board} onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  );
}
