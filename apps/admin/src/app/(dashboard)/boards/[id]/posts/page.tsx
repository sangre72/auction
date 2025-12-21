'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { formatDate } from '@auction/shared';
import { Button, SearchInput, Badge, DataGrid, Alert, Tabs, Card } from '@/components/ui';
import { boardsApi, postsApi, type Board, type PostListItem } from '@/lib/api';

const statusTabs = [
  { id: 'all', label: '전체' },
  { id: 'published', label: '게시됨' },
  { id: 'hidden', label: '숨김' },
  { id: 'deleted', label: '삭제됨' },
];

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

export default function BoardPostsPage() {
  const router = useRouter();
  const params = useParams();
  const boardId = parseInt(params.id as string, 10);

  const [board, setBoard] = useState<Board | null>(null);
  const [posts, setPosts] = useState<PostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [boardRes, postsRes] = await Promise.all([
        boardsApi.getById(boardId),
        postsApi.getList(boardId, {
          page,
          page_size: 20,
          title: searchValue || undefined,
          status: activeTab === 'all' ? undefined : activeTab,
        }),
      ]);

      setBoard(boardRes.data);
      setPosts(postsRes.data);
      setTotalPages(postsRes.meta.total_pages);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [boardId, page, searchValue, activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setPage(1);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleToggleNotice = async (post: PostListItem) => {
    try {
      await postsApi.setNotice(post.id, !post.is_notice);
      fetchData();
    } catch (err) {
      console.error('Failed to toggle notice:', err);
      setError('공지 설정에 실패했습니다.');
    }
  };

  const handleDelete = async (post: PostListItem) => {
    if (!confirm('게시글을 삭제하시겠습니까?')) return;

    try {
      await postsApi.delete(post.id);
      fetchData();
    } catch (err) {
      console.error('Failed to delete post:', err);
      setError('게시글 삭제에 실패했습니다.');
    }
  };

  const columns = [
    {
      key: 'badge',
      header: '',
      render: (post: PostListItem) => (
        <div className="flex gap-1">
          {post.is_notice && (
            <Badge variant="info" className="text-xs">공지</Badge>
          )}
          {post.is_pinned && (
            <Badge variant="warning" className="text-xs">고정</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'title',
      header: '제목',
      render: (post: PostListItem) => (
        <div>
          <span className="font-medium text-gray-900">{post.title}</span>
          {post.comment_count > 0 && (
            <span className="text-purple-600 ml-1">[{post.comment_count}]</span>
          )}
          {post.has_images && (
            <span className="text-gray-400 ml-1" title="이미지 있음">📷</span>
          )}
          {post.has_attachments && (
            <span className="text-gray-400 ml-1" title="첨부파일 있음">📎</span>
          )}
        </div>
      ),
    },
    {
      key: 'author_name',
      header: '작성자',
      render: (post: PostListItem) => (
        <span className="text-gray-600">{post.author_name || '(알 수 없음)'}</span>
      ),
    },
    {
      key: 'view_count',
      header: '조회',
      render: (post: PostListItem) => (
        <span className="text-gray-500">{post.view_count}</span>
      ),
    },
    {
      key: 'like_count',
      header: '좋아요',
      render: (post: PostListItem) => (
        <span className="text-pink-500">{post.like_count}</span>
      ),
    },
    {
      key: 'created_at',
      header: '작성일',
      render: (post: PostListItem) => (
        <span className="text-gray-500 text-sm">{formatDate(post.created_at, { includeTime: true })}</span>
      ),
    },
    {
      key: 'status',
      header: '상태',
      render: (post: PostListItem) => (
        <Badge variant={statusBadgeVariant[post.status] || 'default'}>
          {statusLabel[post.status] || post.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '관리',
      render: (post: PostListItem) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleNotice(post);
            }}
          >
            {post.is_notice ? '공지해제' : '공지설정'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(post);
            }}
          >
            삭제
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {board?.title || '게시판'} 게시글 관리
          </h1>
          <p className="text-gray-600 mt-1">/{board?.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/boards/${boardId}`)}>
            게시판 설정
          </Button>
          <Button variant="outline" onClick={() => router.push('/boards')}>
            목록으로
          </Button>
        </div>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 bg-purple-50 border-purple-200">
          <div className="text-sm text-purple-600">전체 게시글</div>
          <div className="text-2xl font-bold text-purple-700">{posts.length}</div>
        </Card>
        <Card className="p-4 bg-cyan-50 border-cyan-200">
          <div className="text-sm text-cyan-600">총 조회수</div>
          <div className="text-2xl font-bold text-cyan-700">
            {posts.reduce((sum, p) => sum + p.view_count, 0)}
          </div>
        </Card>
        <Card className="p-4 bg-pink-50 border-pink-200">
          <div className="text-sm text-pink-600">총 좋아요</div>
          <div className="text-2xl font-bold text-pink-700">
            {posts.reduce((sum, p) => sum + p.like_count, 0)}
          </div>
        </Card>
        <Card className="p-4 bg-emerald-50 border-emerald-200">
          <div className="text-sm text-emerald-600">총 댓글</div>
          <div className="text-2xl font-bold text-emerald-700">
            {posts.reduce((sum, p) => sum + p.comment_count, 0)}
          </div>
        </Card>
      </div>

      {/* 필터 */}
      <div className="flex items-center justify-between">
        <Tabs tabs={statusTabs} activeTab={activeTab} onChange={handleTabChange} />
        <SearchInput
          value={searchValue}
          onSearch={handleSearch}
          placeholder="제목 검색..."
        />
      </div>

      {/* 에러 */}
      {error && (
        <Alert variant="danger" title="오류" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 데이터 그리드 */}
      <DataGrid
        data={posts}
        columns={columns}
        isLoading={loading}
      />

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            이전
          </Button>
          <span className="text-sm text-gray-600">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            다음
          </Button>
        </div>
      )}
    </div>
  );
}
