'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '@auction/shared';
import { postsApi, boardsApi, type Post, type Board } from '@/lib/api';
import { LikeButton, CommentSection, AttachmentList } from '@/components/board';

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const boardSlug = params.boardSlug as string;
  const postId = parseInt(params.postId as string, 10);

  const [board, setBoard] = useState<Board | null>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | undefined>(undefined);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [boardRes, postRes] = await Promise.all([
        boardsApi.getBySlug(boardSlug),
        postsApi.getById(boardSlug, postId),
      ]);
      setBoard(boardRes.data);
      setPost(postRes.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('게시글을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [boardSlug, postId]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        const response = await fetch(`${API_URL}/users/me`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setCurrentUserId(data.data.id);
        }
      } catch {
        // 비로그인 상태
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async () => {
    if (!confirm('게시글을 삭제하시겠습니까?')) return;

    try {
      await postsApi.delete(boardSlug, postId);
      router.push(`/board/${boardSlug}`);
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert('게시글 삭제에 실패했습니다.');
    }
  };

  const handleAuthRequired = () => {
    alert('로그인이 필요합니다.');
    router.push('/login');
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

  if (error || !post || !board) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-20">
          <div className="text-6xl mb-4">😢</div>
          <p className="text-gray-500 mb-4">{error || '게시글을 찾을 수 없습니다.'}</p>
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

  const isOwner = currentUserId === post.author?.id;

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
        <span className="truncate max-w-xs text-gray-900 font-medium">{post.title}</span>
      </div>

      {/* 게시글 */}
      <article className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* 헤더 */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
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
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                {post.author?.name?.charAt(0) || '?'}
              </div>
              <div>
                <div className="font-semibold text-gray-900">
                  {post.author?.name || '익명'}
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(post.created_at, { includeTime: true })}
                  {post.updated_at !== post.created_at && ' (수정됨)'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="font-medium">{post.view_count}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 본문 */}
        <div className="p-6">
          {/* 이미지 */}
          {post.images && post.images.length > 0 && (
            <div className="mb-6 space-y-4">
              {post.images.map((image) => (
                <div key={image.id} className="rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src={image.image_url}
                    alt=""
                    className="w-full h-auto"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}

          {/* 내용 */}
          <div
            className="prose prose-purple max-w-none prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* 첨부파일 */}
          {post.attachments && post.attachments.length > 0 && (
            <div className="mt-6">
              <AttachmentList attachments={post.attachments} />
            </div>
          )}
        </div>

        {/* 액션 */}
        <div className="p-6 border-t border-gray-100 flex items-center justify-between">
          <LikeButton
            boardSlug={boardSlug}
            postId={postId}
            initialLiked={post.is_liked || false}
            initialCount={post.like_count}
            onAuthRequired={handleAuthRequired}
          />

          {isOwner && (
            <div className="flex items-center gap-2">
              <Link
                href={`/board/${boardSlug}/${postId}/edit`}
                className="px-4 py-2 text-gray-600 hover:text-purple-600 font-medium transition-colors"
              >
                수정
              </Link>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-red-500 hover:text-red-600 font-medium transition-colors"
              >
                삭제
              </button>
            </div>
          )}
        </div>
      </article>

      {/* 댓글 */}
      <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-6">
        <CommentSection
          boardSlug={boardSlug}
          postId={postId}
          currentUserId={currentUserId}
          onAuthRequired={handleAuthRequired}
        />
      </div>

      {/* 목록으로 */}
      <div className="mt-6">
        <Link
          href={`/board/${boardSlug}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 font-medium transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          목록으로
        </Link>
      </div>
    </div>
  );
}
