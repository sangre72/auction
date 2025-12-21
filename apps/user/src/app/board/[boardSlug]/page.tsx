'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatRelativeTime } from '@auction/shared';
import { boardsApi, postsApi, type Board, type PostListItem } from '@/lib/api';

export default function BoardPostsPage() {
  const params = useParams();
  const boardSlug = params.boardSlug as string;

  const [board, setBoard] = useState<Board | null>(null);
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 로그인 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const response = await fetch(`${API_URL}/users/me`, {
          credentials: 'include',
        });
        setIsLoggedIn(response.ok);
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [boardRes, postsRes] = await Promise.all([
        boardsApi.getBySlug(boardSlug),
        postsApi.getList(boardSlug, {
          page,
          page_size: 20,
          title: searchQuery || undefined,
        }),
      ]);
      setBoard(boardRes.data);
      setPosts(postsRes.data);
      setTotalPages(postsRes.meta.total_pages);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [boardSlug, page, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 로딩 상태 (초기) */}
      {loading && !board && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-500 border-t-transparent" />
        </div>
      )}

      {/* 에러 상태 */}
      {(error || (!loading && !board)) && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">😢</div>
          <p className="text-gray-500 mb-4">{error || '게시판을 찾을 수 없습니다.'}</p>
          <Link
            href="/board"
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            게시판 목록으로
          </Link>
        </div>
      )}

      {/* 게시판 컨텐츠 */}
      {board && (
        <>
          {/* 페이지 헤더 */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <Link href="/board" className="hover:text-purple-600 transition-colors">
                게시판
              </Link>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-gray-900 font-medium">{board.title}</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent">
                  {board.title}
                </h1>
                {board.description && (
                  <p className="text-gray-500 mt-2">{board.description}</p>
                )}
              </div>
              {/* write_permission이 'login'이면 로그인 사용자만, 'admin'이면 관리자만 글쓰기 가능 */}
              {isLoggedIn && board.write_permission === 'login' && (
                <Link
                  href={`/board/${boardSlug}/write`}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 rounded-xl shadow-lg shadow-purple-500/25 transition-all hover:scale-105"
                >
                  글쓰기
                </Link>
              )}
            </div>
          </div>

          {/* 검색 */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="제목 검색..."
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors"
              >
                검색
              </button>
            </div>
          </form>

          {/* 게시글 목록 */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-500">게시글이 없습니다.</p>
              <p className="text-gray-400 text-sm mt-2">첫 번째 글을 작성해보세요!</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {posts.map((post, index) => (
                <Link
                  key={post.id}
                  href={`/board/${boardSlug}/${post.id}`}
                  className={`block p-5 hover:bg-purple-50/50 transition-colors ${
                    index !== posts.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {post.is_notice && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                            공지
                          </span>
                        )}
                        {post.is_pinned && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-400 to-orange-500 text-white">
                            고정
                          </span>
                        )}
                        <h3 className="font-semibold text-gray-900 truncate hover:text-purple-600 transition-colors">
                          {post.title}
                        </h3>
                        {post.comment_count > 0 && (
                          <span className="text-purple-600 text-sm font-medium">
                            [{post.comment_count}]
                          </span>
                        )}
                        {post.has_images && (
                          <span className="text-cyan-500" title="이미지">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </span>
                        )}
                        {post.has_attachments && (
                          <span className="text-gray-400" title="첨부파일">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-cyan-400 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white">
                              {(post.author_name || '익')[0]}
                            </span>
                          </div>
                          <span>{post.author_name || '익명'}</span>
                        </div>
                        <span className="text-gray-300">·</span>
                        <span>{formatRelativeTime(post.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400 flex-shrink-0">
                      <div className="flex items-center gap-1" title="조회수">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>{post.view_count}</span>
                      </div>
                      <div className="flex items-center gap-1" title="좋아요">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>{post.like_count}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                이전
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-10 h-10 rounded-xl font-medium transition-all ${
                        page === pageNum
                          ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
