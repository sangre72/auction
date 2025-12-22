'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button, SearchInput, Badge, Card, DataGrid, Tooltip, Tabs, Pagination } from '@/components/ui';
import { bannersApi, BannerListItem, BannerStats } from '@/lib/api';

type Position = 'main_top' | 'main_middle' | 'sidebar' | 'popup' | 'footer';

const positionLabels: Record<Position, string> = {
  main_top: '메인 상단',
  main_middle: '메인 중간',
  sidebar: '사이드바',
  popup: '팝업',
  footer: '푸터',
};

export default function BannersPage() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [banners, setBanners] = useState<BannerListItem[]>([]);
  const [stats, setStats] = useState<BannerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBanners = useCallback(async () => {
    try {
      setIsLoading(true);
      const params: {
        page: number;
        page_size: number;
        title?: string;
        is_active?: boolean;
      } = { page, page_size: 20 };

      if (searchValue) params.title = searchValue;
      if (activeTab === 'active') params.is_active = true;
      if (activeTab === 'inactive') params.is_active = false;

      const response = await bannersApi.getList(params);
      setBanners(response.data);
      setTotalPages(response.meta.total_pages);
    } catch (error) {
      console.error('Failed to fetch banners:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchValue, activeTab]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await bannersApi.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
    fetchStats();
  }, [fetchBanners, fetchStats]);

  const handleToggle = async (id: number) => {
    try {
      await bannersApi.toggle(id);
      fetchBanners();
      fetchStats();
    } catch (error) {
      console.error('Failed to toggle banner:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await bannersApi.delete(id);
      fetchBanners();
      fetchStats();
    } catch (error) {
      console.error('Failed to delete banner:', error);
    }
  };

  const columns = [
    {
      key: 'title' as const,
      header: '제목',
      render: (item: BannerListItem) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
            <ImageIcon className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium text-white">{item.title}</span>
        </div>
      ),
    },
    {
      key: 'position' as const,
      header: '위치',
      render: (item: BannerListItem) => (
        <Badge variant="default">{positionLabels[item.position as Position] || item.position}</Badge>
      ),
    },
    {
      key: 'is_active' as const,
      header: '상태',
      render: (item: BannerListItem) => (
        <Badge variant={item.is_active ? 'success' : 'default'}>
          {item.is_active ? '활성' : '비활성'}
        </Badge>
      ),
    },
    {
      key: 'sort_order' as const,
      header: '순서',
      render: (item: BannerListItem) => (
        <span className="text-purple-400 font-medium">{item.sort_order}</span>
      ),
    },
    {
      key: 'performance' as const,
      header: '클릭/노출',
      render: (item: BannerListItem) => (
        <div className="text-sm">
          <span className="text-cyan-400">{item.click_count.toLocaleString()}</span>
          <span className="text-gray-500"> / </span>
          <span className="text-gray-400">{item.view_count.toLocaleString()}</span>
        </div>
      ),
    },
    {
      key: 'ctr' as const,
      header: 'CTR',
      render: (item: BannerListItem) => {
        const ctr = item.view_count > 0 ? ((item.click_count / item.view_count) * 100).toFixed(1) : '0.0';
        return (
          <span className={`font-medium ${parseFloat(ctr) >= 3 ? 'text-emerald-400' : 'text-gray-400'}`}>
            {ctr}%
          </span>
        );
      },
    },
    {
      key: 'period' as const,
      header: '기간',
      render: (item: BannerListItem) => (
        <span className="text-gray-500 text-sm">
          {item.start_date ? new Date(item.start_date).toLocaleDateString() : '-'} ~ {item.end_date ? new Date(item.end_date).toLocaleDateString() : '무기한'}
        </span>
      ),
    },
    {
      key: 'actions' as const,
      header: '관리',
      render: (item: BannerListItem) => (
        <div className="flex gap-2">
          <Tooltip content="수정">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/banners/${item.id}`);
              }}
            >
              수정
            </Button>
          </Tooltip>
          <Tooltip content={item.is_active ? '비활성화' : '활성화'}>
            <Button
              variant="ghost"
              size="sm"
              className={item.is_active ? 'text-amber-400' : 'text-emerald-400'}
              onClick={(e) => {
                e.stopPropagation();
                handleToggle(item.id);
              }}
            >
              {item.is_active ? '중지' : '시작'}
            </Button>
          </Tooltip>
          <Tooltip content="삭제">
            <Button
              variant="ghost"
              size="sm"
              className="text-red-400"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(item.id);
              }}
            >
              삭제
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  const tabs = [
    { id: 'all', label: `전체 (${stats?.total || 0})` },
    { id: 'active', label: `활성 (${stats?.active || 0})` },
    { id: 'inactive', label: `비활성 (${stats?.inactive || 0})` },
  ];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">배너 광고 관리</h1>
          <p className="text-gray-400">배너 광고를 등록하고 관리합니다.</p>
        </div>
        <Button leftIcon={<PlusIcon />} onClick={() => router.push('/banners/new')}>
          배너 등록
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="활성 배너"
          value={`${stats?.active || 0}개`}
          icon={<ImageIcon />}
          color="emerald"
        />
        <StatCard
          label="비활성 배너"
          value={`${stats?.inactive || 0}개`}
          icon={<ImageIcon />}
          color="amber"
        />
        <StatCard
          label="전체 배너"
          value={`${stats?.total || 0}개`}
          icon={<ChartIcon />}
          color="purple"
        />
        <StatCard
          label="통계"
          value="상세보기"
          icon={<ChartIcon />}
          color="cyan"
          onClick={() => router.push('/banners/stats')}
        />
      </div>

      {/* 검색 및 필터 */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={(tab) => {
              setActiveTab(tab);
              setPage(1);
            }}
          />
          <SearchInput
            className="w-full md:w-80"
            placeholder="배너 제목 검색..."
            onSearch={(value) => {
              setSearchValue(value);
              setPage(1);
            }}
          />
        </div>
      </Card>

      {/* 배너 목록 */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-500 border-t-transparent" />
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🖼️</div>
          <p className="text-gray-400">등록된 배너가 없습니다.</p>
        </div>
      ) : (
        <>
          <DataGrid
            data={banners}
            columns={columns}
            onRowClick={(item) => router.push(`/banners/${item.id}`)}
          />
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

// 통계 카드 컴포넌트
function StatCard({
  label,
  value,
  subValue,
  icon,
  color,
  onClick,
}: {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
  color: 'purple' | 'emerald' | 'amber' | 'cyan';
  onClick?: () => void;
}) {
  const colors = {
    purple: 'from-purple-500/10 to-purple-500/5 border-purple-500/20',
    emerald: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20',
    amber: 'from-amber-500/10 to-amber-500/5 border-amber-500/20',
    cyan: 'from-cyan-500/10 to-cyan-500/5 border-cyan-500/20',
  };

  const iconColors = {
    purple: 'bg-purple-500/20 text-purple-400',
    emerald: 'bg-emerald-500/20 text-emerald-400',
    amber: 'bg-amber-500/20 text-amber-400',
    cyan: 'bg-cyan-500/20 text-cyan-400',
  };

  return (
    <div
      className={`rounded-2xl bg-gradient-to-br ${colors[color]} border p-6 ${onClick ? 'cursor-pointer hover:border-white/20' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-400">{label}</span>
        <div className={`p-2 rounded-xl ${iconColors[color]}`}>{icon}</div>
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
      {subValue && <div className="text-sm text-emerald-400 mt-1">{subValue}</div>}
    </div>
  );
}

// 아이콘 컴포넌트
function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function ImageIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}
