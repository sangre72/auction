'use client';

import { useState } from 'react';
import { Button, SearchInput, Badge, Card, DataGrid, Tooltip, Tabs } from '@/components/ui';

// 데모용 배너 데이터
const banners = [
  { id: '1', title: '연말 대세일', position: 'main_top', isActive: true, priority: 1, clicks: 1234, views: 45678, startDate: '2025-12-01', endDate: '2025-12-31' },
  { id: '2', title: '신규 회원 이벤트', position: 'main_middle', isActive: true, priority: 2, clicks: 567, views: 23456, startDate: '2025-12-15', endDate: '2026-01-15' },
  { id: '3', title: '앱 다운로드', position: 'sidebar', isActive: true, priority: 1, clicks: 890, views: 12345, startDate: '2025-11-01', endDate: null },
  { id: '4', title: '블랙프라이데이', position: 'popup', isActive: false, priority: 1, clicks: 2345, views: 56789, startDate: '2025-11-24', endDate: '2025-11-30' },
  { id: '5', title: '크리스마스 특가', position: 'main_top', isActive: false, priority: 2, clicks: 0, views: 0, startDate: '2025-12-24', endDate: '2025-12-26' },
];

type Position = 'main_top' | 'main_middle' | 'main_bottom' | 'sidebar' | 'popup';

const positionLabels: Record<Position, string> = {
  main_top: '메인 상단',
  main_middle: '메인 중간',
  main_bottom: '메인 하단',
  sidebar: '사이드바',
  popup: '팝업',
};

export default function BannersPage() {
  const [searchValue, setSearchValue] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredBanners = banners.filter(
    (b) => b.title.includes(searchValue)
  ).filter(b => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return b.isActive;
    if (activeTab === 'inactive') return !b.isActive;
    return true;
  });

  const columns = [
    {
      key: 'title' as const,
      header: '제목',
      render: (item: typeof banners[0]) => (
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
      render: (item: typeof banners[0]) => (
        <Badge variant="default">{positionLabels[item.position as Position]}</Badge>
      ),
    },
    {
      key: 'isActive' as const,
      header: '상태',
      render: (item: typeof banners[0]) => (
        <Badge variant={item.isActive ? 'success' : 'default'}>
          {item.isActive ? '활성' : '비활성'}
        </Badge>
      ),
    },
    {
      key: 'priority' as const,
      header: '우선순위',
      render: (item: typeof banners[0]) => (
        <span className="text-purple-400 font-medium">{item.priority}</span>
      ),
    },
    {
      key: 'performance' as const,
      header: '클릭/노출',
      render: (item: typeof banners[0]) => (
        <div className="text-sm">
          <span className="text-cyan-400">{item.clicks.toLocaleString()}</span>
          <span className="text-gray-500"> / </span>
          <span className="text-gray-400">{item.views.toLocaleString()}</span>
        </div>
      ),
    },
    {
      key: 'ctr' as const,
      header: 'CTR',
      render: (item: typeof banners[0]) => {
        const ctr = item.views > 0 ? ((item.clicks / item.views) * 100).toFixed(1) : '0.0';
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
      render: (item: typeof banners[0]) => (
        <span className="text-gray-500 text-sm">
          {item.startDate} ~ {item.endDate || '무기한'}
        </span>
      ),
    },
    {
      key: 'actions' as const,
      header: '관리',
      render: (item: typeof banners[0]) => (
        <div className="flex gap-2">
          <Tooltip content="수정">
            <Button variant="ghost" size="sm">수정</Button>
          </Tooltip>
          <Tooltip content={item.isActive ? '비활성화' : '활성화'}>
            <Button variant="ghost" size="sm" className={item.isActive ? 'text-amber-400' : 'text-emerald-400'}>
              {item.isActive ? '중지' : '시작'}
            </Button>
          </Tooltip>
          <Tooltip content="삭제">
            <Button variant="ghost" size="sm" className="text-red-400">삭제</Button>
          </Tooltip>
        </div>
      ),
    },
  ];

  const tabs = [
    { id: 'all', label: '전체' },
    { id: 'active', label: '활성' },
    { id: 'inactive', label: '비활성' },
  ];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">배너 광고 관리</h1>
          <p className="text-gray-400">배너 광고를 등록하고 관리합니다.</p>
        </div>
        <Button leftIcon={<PlusIcon />}>배너 등록</Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="활성 배너"
          value="3개"
          icon={<ImageIcon />}
          color="emerald"
        />
        <StatCard
          label="오늘 노출"
          value="12,345"
          subValue="+15% 어제 대비"
          icon={<EyeIcon />}
          color="purple"
        />
        <StatCard
          label="오늘 클릭"
          value="567"
          subValue="+8% 어제 대비"
          icon={<CursorIcon />}
          color="cyan"
        />
        <StatCard
          label="평균 CTR"
          value="4.5%"
          icon={<ChartIcon />}
          color="amber"
        />
      </div>

      {/* 검색 및 필터 */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          <SearchInput
            className="w-full md:w-80"
            placeholder="배너 제목 검색..."
            onSearch={setSearchValue}
          />
        </div>
      </Card>

      {/* 배너 목록 */}
      <DataGrid
        data={filteredBanners}
        columns={columns}
        onRowClick={(item) => console.log('배너 클릭:', item)}
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

function EyeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function CursorIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
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
