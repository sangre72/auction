'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { boardsApi, postsApi, type Board, type PostCreate } from '@/lib/api';

export default function WritePostPage() {
  const params = useParams();
  const router = useRouter();
  const boardSlug = params.boardSlug as string;

  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const fetchBoard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await boardsApi.getBySlug(boardSlug);
      setBoard(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch board:', err);
      setError('게시판 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [boardSlug]);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('제목을 입력해주세요.');
      return;
    }

    if (!content.trim()) {
      setError('내용을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const data: PostCreate = {
        title: title.trim(),
        content: content.trim(),
      };

      const response = await postsApi.create(boardSlug, data);
      router.push(`/board/${boardSlug}/${response.data.id}`);
    } catch (err) {
      const apiError = err as { status?: number; detail?: string };
      if (apiError?.status === 401) {
        alert('로그인이 필요합니다.');
        router.push('/login');
      } else if (apiError?.status === 403) {
        setError('글쓰기 권한이 없습니다.');
      } else {
        console.error('Failed to create post:', err);
        setError(apiError?.detail || '게시글 작성에 실패했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-500 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-20">
          <div className="text-6xl mb-4">😢</div>
          <p className="text-gray-500 mb-4">게시판을 찾을 수 없습니다.</p>
          <Link
            href="/board"
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            게시판 목록으로
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 브레드크럼 */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/board" className="hover:text-purple-600 transition-colors">
          게시판
        </Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <Link href={`/board/${boardSlug}`} className="hover:text-purple-600 transition-colors">
          {board.title}
        </Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-900 font-medium">글쓰기</span>
      </div>

      {/* 제목 */}
      <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent mb-6">
        글쓰기
      </h1>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-6 border border-red-100">
          {error}
        </div>
      )}

      {/* 폼 */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          {/* 제목 입력 */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              제목
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              required
            />
          </div>

          {/* 내용 입력 */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              내용
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="내용을 입력하세요"
              rows={15}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none transition-all"
              required
            />
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex items-center justify-end gap-3">
          <Link
            href={`/board/${boardSlug}`}
            className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 rounded-xl shadow-lg shadow-purple-500/25 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubmitting ? '작성 중...' : '등록'}
          </button>
        </div>
      </form>
    </div>
  );
}
