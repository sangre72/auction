'use client';

import { useState } from 'react';
import { Button, SearchInput, Badge, Card, DataGrid, Tooltip, Tabs } from '@/components/ui';

// 데모용 사용자 데이터
const users = [
  { id: '1', name: '홍길동', email: 'hong@example.com', provider: 'kakao', role: 'user', status: 'active', createdAt: '2025-01-15', lastLogin: '2025-12-20' },
  { id: '2', name: '김철수', email: 'kim@example.com', provider: 'naver', role: 'user', status: 'active', createdAt: '2025-02-20', lastLogin: '2025-12-19' },
  { id: '3', name: '이영희', email: 'lee@example.com', provider: 'google', role: 'user', status: 'suspended', createdAt: '2025-03-10', lastLogin: '2025-12-01' },
  { id: '4', name: '박민수', email: 'park@example.com', provider: 'kakao', role: 'admin', status: 'active', createdAt: '2025-01-01', lastLogin: '2025-12-20' },
  { id: '5', name: '최예술', email: 'choi@example.com', provider: 'naver', role: 'user', status: 'active', createdAt: '2025-04-05', lastLogin: '2025-12-18' },
];

type Provider = 'kakao' | 'naver' | 'google';
type Status = 'active' | 'suspended' | 'banned';

const providerConfig: Record<Provider, { label: string; variant: 'warning' | 'success' | 'info' }> = {
  kakao: { label: '카카오', variant: 'warning' },
  naver: { label: '네이버', variant: 'success' },
  google: { label: '구글', variant: 'info' },
};

const statusConfig: Record<Status, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' }> = {
  active: { label: '활성', variant: 'success' },
  suspended: { label: '정지', variant: 'warning' },
  banned: { label: '차단', variant: 'danger' },
};

export default function UsersPage() {
  const [searchValue, setSearchValue] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredUsers = users.filter(
    (u) => u.name.includes(searchValue) || u.email.includes(searchValue)
  ).filter(u => {
    if (activeTab === 'all') return true;
    if (activeTab === 'admin') return u.role === 'admin';
    return u.status === activeTab;
  });

  const columns = [
    {
      key: 'name' as const,
      header: '이름',
      render: (item: typeof users[0]) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
            <span className="text-xs font-bold text-white">{item.name.charAt(0)}</span>
          </div>
          <span className="font-medium text-white">{item.name}</span>
        </div>
      ),
    },
    {
      key: 'email' as const,
      header: '이메일',
      render: (item: typeof users[0]) => (
        <span className="text-gray-400">{item.email}</span>
      ),
    },
    {
      key: 'provider' as const,
      header: '가입 방식',
      render: (item: typeof users[0]) => {
        const config = providerConfig[item.provider as Provider];
        return (
          <div className="flex items-center gap-2">
            <ProviderIcon provider={item.provider as Provider} />
            <Badge variant={config.variant}>{config.label}</Badge>
          </div>
        );
      },
    },
    {
      key: 'role' as const,
      header: '권한',
      render: (item: typeof users[0]) => (
        item.role === 'admin' ? (
          <span className="text-purple-400 font-medium flex items-center gap-1">
            <ShieldIcon />
            관리자
          </span>
        ) : (
          <span className="text-gray-400">일반</span>
        )
      ),
    },
    {
      key: 'status' as const,
      header: '상태',
      render: (item: typeof users[0]) => {
        const config = statusConfig[item.status as Status];
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      key: 'lastLogin' as const,
      header: '최근 로그인',
    },
    {
      key: 'actions' as const,
      header: '관리',
      render: (item: typeof users[0]) => (
        <div className="flex gap-2">
          <Tooltip content="사용자 상세">
            <Button variant="ghost" size="sm">상세</Button>
          </Tooltip>
          <Tooltip content={item.status === 'active' ? '계정 정지' : '정지 해제'}>
            <Button variant="ghost" size="sm" className={item.status === 'active' ? 'text-amber-400' : 'text-emerald-400'}>
              {item.status === 'active' ? '정지' : '해제'}
            </Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  const tabs = [
    { id: 'all', label: '전체' },
    { id: 'active', label: '활성' },
    { id: 'suspended', label: '정지' },
    { id: 'admin', label: '관리자' },
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
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="전체 사용자" value="1,234" subValue="+23 오늘" icon={<UsersIcon />} color="purple" />
        <StatCard label="활성 사용자" value="1,189" subValue="96.4%" icon={<UserCheckIcon />} color="emerald" />
        <StatCard label="정지된 사용자" value="45" icon={<UserMinusIcon />} color="amber" />
        <StatCard label="관리자" value="5" icon={<ShieldIcon />} color="cyan" />
      </div>

      {/* 검색 및 필터 */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          <SearchInput
            className="w-full md:w-80"
            placeholder="이름 또는 이메일 검색..."
            onSearch={setSearchValue}
          />
        </div>
      </Card>

      {/* 사용자 목록 */}
      <DataGrid
        data={filteredUsers}
        columns={columns}
        onRowClick={(item) => console.log('사용자 클릭:', item)}
      />
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
  value: string;
  subValue?: string;
  icon: React.ReactNode;
  color: 'purple' | 'emerald' | 'amber' | 'cyan';
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
    <div className={`rounded-2xl bg-gradient-to-br ${colors[color]} border p-6`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-400">{label}</span>
        <div className={`p-2 rounded-xl ${iconColors[color]}`}>{icon}</div>
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
      {subValue && <div className="text-sm text-emerald-400 mt-1">{subValue}</div>}
    </div>
  );
}

// 프로바이더 아이콘
function ProviderIcon({ provider }: { provider: Provider }) {
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
  return (
    <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
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

function ShieldIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}
