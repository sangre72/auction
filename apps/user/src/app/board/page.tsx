'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { boardsApi, type BoardListItem } from '@/lib/api';

export default function BoardsPage() {
  const [boards, setBoards] = useState<BoardListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBoards = useCallback(async () => {
    try {
      setLoading(true);
      const response = await boardsApi.getList();
      setBoards(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch boards:', err);
      setError('게시판 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
          게시판
        </h1>
        <p className="text-gray-500 mt-2">커뮤니티 게시판 목록입니다.</p>
      </div>

      {/* 로딩 상태 */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-500 border-t-transparent" />
        </div>
      )}

      {/* 에러 상태 */}
      {error && !loading && (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchBoards}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 게시판 없음 */}
      {!loading && !error && boards.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-gray-500">등록된 게시판이 없습니다.</p>
        </div>
      )}

      {/* 게시판 그리드 */}
      {!loading && !error && boards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <Link
              key={board.id}
              href={`/board/${board.name}`}
              className="group block p-6 bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:border-purple-200 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                      {board.title}
                    </h2>
                  </div>
                  {board.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 ml-13">
                      {board.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                <span className="text-sm text-gray-400">/{board.name}</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-purple-100 to-cyan-100 text-purple-700">
                  {board.post_count}개의 글
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
