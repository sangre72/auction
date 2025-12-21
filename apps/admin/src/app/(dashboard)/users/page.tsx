'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button, SearchInput, Badge, Card, DataGrid, Tooltip, Tabs, Pagination } from '@/components/ui';
import { usersApi } from '@/lib/api';
import type { UserListItem, UserStats, UserStatus, UserProvider } from '@/lib/api';

type StatusTab = 'all' | UserStatus;

const providerConfig: Record<UserProvider, { label: string; variant: 'warning' | 'success' | 'info' | 'default' }> = {
  kakao: { label: '카카오', variant: 'warning' },
  naver: { label: '네이버', variant: 'success' },
  google: { label: '구글', variant: 'info' },
  email: { label: '이메일', variant: 'default' },
};

const statusConfig: Record<UserStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }> = {
  active: { label: '활성', variant: 'success' },
  inactive: { label: '휴면', variant: 'default' },
  suspended: { label: '정지', variant: 'warning' },
  banned: { label: '차단', variant: 'danger' },
  deleted: { label: '탈퇴', variant: 'info' },
};

export default function UsersPage() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');
  const [activeTab, setActiveTab] = useState<StatusTab>('all');
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: {
        page: number;
        page_size: number;
        name?: string;
        email?: string;
        status?: UserStatus;
      } = {
        page,
        page_size: pageSize,
      };

      // 검색어가 있으면 이름과 이메일 모두 검색
      if (searchValue) {
        params.name = searchValue;
      }

      // 상태 필터
      if (activeTab !== 'all') {
        params.status = activeTab;
      }

      const response = await usersApi.getList(params);
      setUsers(response.data);
      setTotalPages(response.meta.total_pages);
      setTotalCount(response.meta.total_count);
    } catch (error) {
      console.error('사용자 목록 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchValue, activeTab]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await usersApi.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('사용자 통계 조회 실패:', error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // 검색 또는 탭 변경 시 페이지 초기화
  useEffect(() => {
    setPage(1);
  }, [searchValue, activeTab]);

  const handleStatusChange = async (userId: number, action: 'suspend' | 'activate' | 'ban' | 'set-inactive') => {
    try {
      switch (action) {
        case 'suspend':
          await usersApi.suspend(userId);
          break;
        case 'activate':
          await usersApi.activate(userId);
          break;
        case 'ban':
          await usersApi.ban(userId);
          break;
        case 'set-inactive':
          await usersApi.setInactive(userId);
          break;
      }
      // 목록과 통계 새로고침
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('상태 변경 실패:', error);
    }
  };

  const columns = [
    {
      key: 'name' as const,
      header: '사용자',
      render: (item: UserListItem) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
            <span className="text-xs font-bold text-white">
              {(item.nickname || item.name || 'U').charAt(0)}
            </span>
          </div>
          <div>
            <div className="font-medium text-white">{item.nickname || item.name || '-'}</div>
            <div className="text-sm text-gray-400">{item.email || '-'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'provider' as const,
      header: '가입 방식',
      render: (item: UserListItem) => {
        const config = providerConfig[item.provider];
        return (
          <div className="flex items-center gap-2">
            <ProviderIcon provider={item.provider} />
            <Badge variant={config.variant}>{config.label}</Badge>
          </div>
        );
      },
    },
    {
      key: 'status' as const,
      header: '상태',
      render: (item: UserListItem) => {
        const config = statusConfig[item.status];
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      key: 'is_verified' as const,
      header: '인증',
      render: (item: UserListItem) => (
        item.is_verified ? (
          <span className="text-emerald-400 flex items-center gap-1">
            <VerifiedIcon />
            인증됨
          </span>
        ) : (
          <span className="text-gray-500">미인증</span>
        )
      ),
    },
    {
      key: 'point_balance' as const,
      header: '포인트',
      render: (item: UserListItem) => (
        <span className="text-cyan-400 font-medium">
          {item.point_balance.toLocaleString()}P
        </span>
      ),
    },
    {
      key: 'last_login_at' as const,
      header: '최근 로그인',
      render: (item: UserListItem) => (
        <span className="text-gray-400">
          {item.last_login_at
            ? new Date(item.last_login_at).toLocaleDateString('ko-KR')
            : '-'}
        </span>
      ),
    },
    {
      key: 'created_at' as const,
      header: '가입일',
      render: (item: UserListItem) => (
        <span className="text-gray-400">
          {new Date(item.created_at).toLocaleDateString('ko-KR')}
        </span>
      ),
    },
    {
      key: 'actions' as const,
      header: '관리',
      render: (item: UserListItem) => (
        <div className="flex gap-1">
          <Tooltip content="상세 보기">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/users/${item.id}`);
              }}
            >
              상세
            </Button>
          </Tooltip>
          {item.status === 'active' && (
            <Tooltip content="계정 정지">
              <Button
                variant="ghost"
                size="sm"
                className="text-amber-400"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(item.id, 'suspend');
                }}
              >
                정지
              </Button>
            </Tooltip>
          )}
          {item.status === 'suspended' && (
            <Tooltip content="정지 해제">
              <Button
                variant="ghost"
                size="sm"
                className="text-emerald-400"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(item.id, 'activate');
                }}
              >
                해제
              </Button>
            </Tooltip>
          )}
          {(item.status === 'active' || item.status === 'suspended') && (
            <Tooltip content="영구 차단">
              <Button
                variant="ghost"
                size="sm"
                className="text-red-400"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(item.id, 'ban');
                }}
              >
                차단
              </Button>
            </Tooltip>
          )}
          {item.status === 'banned' && (
            <Tooltip content="차단 해제">
              <Button
                variant="ghost"
                size="sm"
                className="text-emerald-400"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(item.id, 'activate');
                }}
              >
                해제
              </Button>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  const tabs = [
    { id: 'all', label: `전체 (${stats?.total ?? 0})` },
    { id: 'active', label: `활성 (${stats?.active ?? 0})` },
    { id: 'inactive', label: `휴면 (${stats?.inactive ?? 0})` },
    { id: 'suspended', label: `정지 (${stats?.suspended ?? 0})` },
    { id: 'banned', label: `차단 (${stats?.banned ?? 0})` },
  ];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">사용자 관리</h1>
          <p className="text-gray-400">등록된 사용자를 조회하고 관리합니다.</p>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-5">
        <StatCard
          label="전체 사용자"
          value={stats?.total ?? 0}
          icon={<UsersIcon />}
          color="purple"
        />
        <StatCard
          label="활성 사용자"
          value={stats?.active ?? 0}
          subValue={stats ? `${((stats.active / stats.total) * 100).toFixed(1)}%` : undefined}
          icon={<UserCheckIcon />}
          color="emerald"
        />
        <StatCard
          label="휴면 사용자"
          value={stats?.inactive ?? 0}
          icon={<UserSleepIcon />}
          color="gray"
        />
        <StatCard
          label="정지된 사용자"
          value={stats?.suspended ?? 0}
          icon={<UserMinusIcon />}
          color="amber"
        />
        <StatCard
          label="차단된 사용자"
          value={stats?.banned ?? 0}
          icon={<UserBanIcon />}
          color="red"
        />
      </div>

      {/* 검색 및 필터 */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={(tab) => setActiveTab(tab as StatusTab)} />
          <SearchInput
            className="w-full md:w-80"
            placeholder="이름 또는 이메일 검색..."
            onSearch={setSearchValue}
          />
        </div>
      </Card>

      {/* 사용자 목록 */}
      {isLoading ? (
        <Card className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        </Card>
      ) : (
        <>
          <DataGrid
            data={users}
            columns={columns}
            onRowClick={(item) => router.push(`/users/${item.id}`)}
          />
          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
          {users.length === 0 && (
            <Card className="p-8">
              <div className="text-center text-gray-400">
                {searchValue ? '검색 결과가 없습니다.' : '사용자가 없습니다.'}
              </div>
            </Card>
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
}: {
  label: string;
  value: number;
  subValue?: string;
  icon: React.ReactNode;
  color: 'purple' | 'emerald' | 'amber' | 'cyan' | 'red' | 'gray';
}) {
  const colors = {
    purple: 'from-purple-500/10 to-purple-500/5 border-purple-500/20',
    emerald: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20',
    amber: 'from-amber-500/10 to-amber-500/5 border-amber-500/20',
    cyan: 'from-cyan-500/10 to-cyan-500/5 border-cyan-500/20',
    red: 'from-red-500/10 to-red-500/5 border-red-500/20',
    gray: 'from-gray-500/10 to-gray-500/5 border-gray-500/20',
  };

  const iconColors = {
    purple: 'bg-purple-500/20 text-purple-400',
    emerald: 'bg-emerald-500/20 text-emerald-400',
    amber: 'bg-amber-500/20 text-amber-400',
    cyan: 'bg-cyan-500/20 text-cyan-400',
    red: 'bg-red-500/20 text-red-400',
    gray: 'bg-gray-500/20 text-gray-400',
  };

  return (
    <div className={`rounded-2xl bg-gradient-to-br ${colors[color]} border p-6`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-400">{label}</span>
        <div className={`p-2 rounded-xl ${iconColors[color]}`}>{icon}</div>
      </div>
      <div className="text-3xl font-bold text-white">{value.toLocaleString()}</div>
      {subValue && <div className="text-sm text-emerald-400 mt-1">{subValue}</div>}
    </div>
  );
}

// 프로바이더 아이콘
function ProviderIcon({ provider }: { provider: UserProvider }) {
  if (provider === 'kakao') {
    return (
      <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3c5.8 0 10.5 3.66 10.5 8.18 0 4.52-4.7 8.18-10.5 8.18-1.04 0-2.04-.1-3-.3l-3.77 2.53c-.31.21-.72-.03-.65-.4l.65-3.47C3.45 16.18 1.5 13.5 1.5 11.18 1.5 6.66 6.2 3 12 3z"/>
      </svg>
    );
  }
  if (provider === 'naver') {
    return (
      <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.27 11.97L7.54 2H2v20h5.73V12.03L16.46 22H22V2h-5.73v9.97z"/>
      </svg>
    );
  }
  if (provider === 'google') {
    return (
      <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

// 아이콘 컴포넌트
function UsersIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function UserCheckIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11l2 2 4-4" />
    </svg>
  );
}

function UserMinusIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11h6" />
    </svg>
  );
}

function UserSleepIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
    </svg>
  );
}

function UserBanIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
  );
}

function VerifiedIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}
