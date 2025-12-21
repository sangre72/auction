'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button, SearchInput, Badge, DataGrid, Alert, Tabs, Card } from '@/components/ui';
import { boardsApi, type BoardListItem, type BoardStats } from '@/lib/api';

const statusTabs = [
  { id: 'all', label: '전체' },
  { id: 'active', label: '활성화' },
  { id: 'inactive', label: '비활성화' },
];

export default function BoardsPage() {
  const router = useRouter();
  const [boards, setBoards] = useState<BoardListItem[]>([]);
  const [stats, setStats] = useState<BoardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const is_active = activeTab === 'all' ? undefined : activeTab === 'active';
      const [boardsRes, statsRes] = await Promise.all([
        boardsApi.getList({ is_active }),
        boardsApi.getStats(),
      ]);

      setBoards(boardsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to fetch boards:', err);
      setError('게시판 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleActive = async (board: BoardListItem) => {
    try {
      await boardsApi.update(board.id, { is_active: !board.is_active });
      fetchData();
    } catch (err) {
      console.error('Failed to update board:', err);
      setError('게시판 상태 변경에 실패했습니다.');
    }
  };

  const handleDelete = async (board: BoardListItem) => {
    if (!confirm(`'${board.title}' 게시판을 삭제하시겠습니까?\n게시판 내 모든 게시글도 함께 삭제됩니다.`)) {
      return;
    }

    try {
      await boardsApi.delete(board.id);
      fetchData();
    } catch (err) {
      console.error('Failed to delete board:', err);
      setError('게시판 삭제에 실패했습니다.');
    }
  };

  const columns = [
    {
      key: 'sort_order',
      header: '순서',
      render: (board: BoardListItem) => (
        <span className="text-gray-500">{board.sort_order}</span>
      ),
    },
    {
      key: 'title',
      header: '게시판',
      render: (board: BoardListItem) => (
        <div>
          <div className="font-medium text-gray-900">{board.title}</div>
          <div className="text-sm text-gray-500">/{board.name}</div>
        </div>
      ),
    },
    {
      key: 'post_count',
      header: '게시글',
      render: (board: BoardListItem) => (
        <span className="font-medium text-purple-600">{board.post_count}</span>
      ),
    },
    {
      key: 'is_active',
      header: '상태',
      render: (board: BoardListItem) => (
        <Badge variant={board.is_active ? 'success' : 'default'}>
          {board.is_active ? '활성화' : '비활성화'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '관리',
      render: (board: BoardListItem) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/boards/${board.id}/posts`);
            }}
          >
            게시글
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/boards/${board.id}`);
            }}
          >
            편집
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleActive(board);
            }}
          >
            {board.is_active ? '비활성화' : '활성화'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(board);
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
          <h1 className="text-2xl font-bold text-gray-900">게시판 관리</h1>
          <p className="text-gray-600 mt-1">게시판을 생성하고 관리합니다.</p>
        </div>
        <Button onClick={() => router.push('/boards/new')}>
          게시판 추가
        </Button>
      </div>

      {/* 통계 카드 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-4 bg-purple-50 border-purple-200">
            <div className="text-sm text-purple-600">전체 게시판</div>
            <div className="text-2xl font-bold text-purple-700">{stats.total}</div>
          </Card>
          <Card className="p-4 bg-emerald-50 border-emerald-200">
            <div className="text-sm text-emerald-600">활성화</div>
            <div className="text-2xl font-bold text-emerald-700">{stats.active}</div>
          </Card>
          <Card className="p-4 bg-gray-50 border-gray-200">
            <div className="text-sm text-gray-600">비활성화</div>
            <div className="text-2xl font-bold text-gray-700">{stats.inactive}</div>
          </Card>
          <Card className="p-4 bg-cyan-50 border-cyan-200">
            <div className="text-sm text-cyan-600">전체 게시글</div>
            <div className="text-2xl font-bold text-cyan-700">{stats.total_posts}</div>
          </Card>
          <Card className="p-4 bg-amber-50 border-amber-200">
            <div className="text-sm text-amber-600">오늘 게시글</div>
            <div className="text-2xl font-bold text-amber-700">{stats.today_posts}</div>
          </Card>
        </div>
      )}

      {/* 필터 */}
      <Tabs tabs={statusTabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* 에러 */}
      {error && (
        <Alert variant="danger" title="오류" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 데이터 그리드 */}
      <DataGrid
        data={boards}
        columns={columns}
        isLoading={loading}
        onRowClick={(board) => router.push(`/boards/${board.id}`)}
      />
    </div>
  );
}
