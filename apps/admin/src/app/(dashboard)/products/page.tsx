'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, SearchInput, Badge, Card, DataGrid, Alert, Tooltip, Tabs } from '@/components/ui';
import { productsApi, ProductListItem, ProductStats } from '@/lib/api';

type ProductStatus = 'pending' | 'approved' | 'active' | 'ended' | 'cancelled' | 'rejected';

const statusConfig: Record<ProductStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }> = {
  pending: { label: '대기중', variant: 'warning' },
  approved: { label: '승인됨', variant: 'info' },
  active: { label: '진행중', variant: 'success' },
  ended: { label: '종료', variant: 'default' },
  cancelled: { label: '취소', variant: 'danger' },
  rejected: { label: '반려', variant: 'danger' },
};


export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const statusFilter = activeTab === 'all' ? undefined : activeTab;
      const response = await productsApi.getList({
        page,
        page_size: 20,
        title: searchValue || undefined,
        status: statusFilter,
      });

      setProducts(response.data);
      setTotalPages(response.meta.total_pages);
      setTotalCount(response.meta.total_count);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('상품 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [page, searchValue, activeTab]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await productsApi.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleApprove = async (id: number) => {
    try {
      await productsApi.approve(id);
      fetchProducts();
      fetchStats();
    } catch (err) {
      console.error('Failed to approve:', err);
      alert('승인에 실패했습니다.');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await productsApi.reject(id);
      fetchProducts();
      fetchStats();
    } catch (err) {
      console.error('Failed to reject:', err);
      alert('반려에 실패했습니다.');
    }
  };

  const handleToggleFeatured = async (id: number, currentValue: boolean) => {
    try {
      await productsApi.setFeatured(id, !currentValue);
      fetchProducts();
    } catch (err) {
      console.error('Failed to toggle featured:', err);
      alert('추천 상품 설정에 실패했습니다.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await productsApi.delete(id);
      fetchProducts();
      fetchStats();
    } catch (err) {
      console.error('Failed to delete:', err);
      alert('삭제에 실패했습니다.');
    }
  };

  const columns = [
    {
      key: 'thumbnail' as const,
      header: '',
      render: (item: ProductListItem) => (
        <div className="w-12 h-12 rounded-lg bg-slate-700 overflow-hidden flex-shrink-0">
          {item.thumbnail_url ? (
            <img src={item.thumbnail_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PackageIcon className="w-5 h-5 text-gray-500" />
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'title' as const,
      header: '상품명',
      render: (item: ProductListItem) => (
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-white truncate">{item.title}</span>
            {item.is_featured && (
              <Badge variant="warning" className="flex-shrink-0">추천</Badge>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">
            {item.category_name || '미분류'}
          </div>
        </div>
      ),
    },
    {
      key: 'price' as const,
      header: '가격',
      render: (item: ProductListItem) => (
        <div className="text-sm">
          {item.slot_price ? (
            <>
              <div className="text-purple-400 font-medium">
                {item.slot_price.toLocaleString()}원/슬롯
              </div>
              <div className="text-gray-500 text-xs">
                {item.sold_slot_count}/{item.slot_count} 슬롯
              </div>
            </>
          ) : (
            <>
              <div className="text-emerald-400 font-medium">
                {(item.current_price || item.starting_price).toLocaleString()}원
              </div>
              <div className="text-gray-500 text-xs">
                시작가: {item.starting_price.toLocaleString()}원
              </div>
            </>
          )}
        </div>
      ),
    },
    {
      key: 'status' as const,
      header: '상태',
      render: (item: ProductListItem) => {
        const config = statusConfig[item.status as ProductStatus] || { label: item.status, variant: 'default' as const };
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      key: 'bids' as const,
      header: '입찰',
      render: (item: ProductListItem) => (
        <span className="text-cyan-400">{item.bid_count}건</span>
      ),
    },
    {
      key: 'endTime' as const,
      header: '종료일',
      render: (item: ProductListItem) => (
        <span className="text-gray-500 text-sm">
          {item.end_time ? new Date(item.end_time).toLocaleDateString('ko-KR') : '-'}
        </span>
      ),
    },
    {
      key: 'actions' as const,
      header: '관리',
      render: (item: ProductListItem) => (
        <div className="flex gap-1">
          <Tooltip content="상세">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/products/${item.id}`);
              }}
            >
              상세
            </Button>
          </Tooltip>
          {item.status === 'pending' && (
            <>
              <Tooltip content="승인">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-emerald-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApprove(item.id);
                  }}
                >
                  승인
                </Button>
              </Tooltip>
              <Tooltip content="반려">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReject(item.id);
                  }}
                >
                  반려
                </Button>
              </Tooltip>
            </>
          )}
          <Tooltip content={item.is_featured ? '추천 해제' : '추천 설정'}>
            <Button
              variant="ghost"
              size="sm"
              className={item.is_featured ? 'text-amber-400' : 'text-gray-400'}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleFeatured(item.id, item.is_featured);
              }}
            >
              <StarIcon filled={item.is_featured} />
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
    { id: 'all', label: '전체' },
    { id: 'pending', label: '대기중' },
    { id: 'active', label: '진행중' },
    { id: 'ended', label: '종료' },
  ];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">상품 관리</h1>
          <p className="text-gray-400">경매 상품을 등록하고 관리합니다.</p>
        </div>
        <Link href="/products/new">
          <Button leftIcon={<PlusIcon />}>상품 등록</Button>
        </Link>
      </div>

      {/* 에러 알림 */}
      {error && (
        <Alert variant="danger" title="오류" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-5">
        <StatCard label="전체 상품" value={stats?.total || 0} icon={<PackageIcon />} color="purple" />
        <StatCard label="대기중" value={stats?.pending || 0} icon={<ClockIcon />} color="amber" />
        <StatCard label="진행중" value={stats?.active || 0} icon={<PlayIcon />} color="emerald" />
        <StatCard label="종료" value={stats?.ended || 0} icon={<CheckIcon />} color="slate" />
        <StatCard label="취소" value={stats?.cancelled || 0} icon={<XIcon />} color="red" />
      </div>

      {/* 검색 및 필터 */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => { setActiveTab(id); setPage(1); }} />
          <SearchInput
            className="w-full md:w-80"
            placeholder="상품명 검색..."
            onSearch={(value) => { setSearchValue(value); setPage(1); }}
          />
        </div>
      </Card>

      {/* 상품 목록 */}
      {loading ? (
        <Card className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
            <span className="ml-3 text-gray-400">불러오는 중...</span>
          </div>
        </Card>
      ) : products.length === 0 ? (
        <Card className="p-8">
          <div className="text-center text-gray-400">
            {searchValue || activeTab !== 'all' ? '검색 결과가 없습니다.' : '등록된 상품이 없습니다.'}
          </div>
        </Card>
      ) : (
        <>
          <DataGrid
            data={products}
            columns={columns}
            onRowClick={(item) => router.push(`/products/${item.id}`)}
          />

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                총 {totalCount}개 중 {(page - 1) * 20 + 1}-{Math.min(page * 20, totalCount)}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  이전
                </Button>
                <span className="px-4 py-2 text-sm text-gray-400">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  다음
                </Button>
              </div>
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
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: 'purple' | 'emerald' | 'amber' | 'slate' | 'cyan' | 'red';
}) {
  const colors = {
    purple: 'from-purple-500/10 to-purple-500/5 border-purple-500/20 hover:border-purple-500/40',
    emerald: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40',
    amber: 'from-amber-500/10 to-amber-500/5 border-amber-500/20 hover:border-amber-500/40',
    slate: 'from-slate-500/10 to-slate-500/5 border-slate-500/20 hover:border-slate-500/40',
    cyan: 'from-cyan-500/10 to-cyan-500/5 border-cyan-500/20 hover:border-cyan-500/40',
    red: 'from-red-500/10 to-red-500/5 border-red-500/20 hover:border-red-500/40',
  };

  const iconColors = {
    purple: 'bg-purple-500/20 text-purple-400',
    emerald: 'bg-emerald-500/20 text-emerald-400',
    amber: 'bg-amber-500/20 text-amber-400',
    slate: 'bg-slate-500/20 text-slate-400',
    cyan: 'bg-cyan-500/20 text-cyan-400',
    red: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className={`rounded-2xl bg-gradient-to-br ${colors[color]} border p-5 transition-all`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-400">{label}</span>
        <div className={`p-2 rounded-xl ${iconColors[color]}`}>{icon}</div>
      </div>
      <div className="text-2xl font-bold text-white">{value.toLocaleString()}</div>
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

function PackageIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function StarIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg className="w-4 h-4" fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}
