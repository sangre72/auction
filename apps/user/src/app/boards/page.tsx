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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">게시판</h1>

      {boards.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          등록된 게시판이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {boards.map((board) => (
            <Link
              key={board.id}
              href={`/boards/${board.name}`}
              className="block p-6 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                    {board.title}
                  </h2>
                  {board.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {board.description}
                    </p>
                  )}
                </div>
                <div className="flex-shrink-0 ml-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                    {board.post_count}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-400">
                <span>/{board.name}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
