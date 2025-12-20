'use client';

import { useState } from 'react';
import { Button, SearchInput, Badge, Card, DataGrid, Tabs } from '@/components/ui';

// 데모용 포인트 거래 데이터
const transactions = [
  { id: 'T001', user: '홍길동', type: 'earn', amount: 5000, balance: 15000, description: '경매 낙찰 적립', createdAt: '2025-12-20 14:30' },
  { id: 'T002', user: '김철수', type: 'spend', amount: -10000, balance: 5000, description: '상품 결제 사용', createdAt: '2025-12-20 13:15' },
  { id: 'T003', user: '이영희', type: 'admin_grant', amount: 50000, balance: 50000, description: '이벤트 포인트 지급', createdAt: '2025-12-20 11:45' },
  { id: 'T004', user: '박민수', type: 'refund', amount: 15000, balance: 30000, description: '결제 취소 환급', createdAt: '2025-12-19 16:20' },
  { id: 'T005', user: '최예술', type: 'expire', amount: -5000, balance: 0, description: '유효기간 만료', createdAt: '2025-12-19 00:00' },
];

type TransactionType = 'earn' | 'spend' | 'refund' | 'admin_grant' | 'admin_deduct' | 'expire';

const typeConfig: Record<TransactionType, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }> = {
  earn: { label: '적립', variant: 'success' },
  spend: { label: '사용', variant: 'info' },
  refund: { label: '환급', variant: 'warning' },
  admin_grant: { label: '지급', variant: 'success' },
  admin_deduct: { label: '차감', variant: 'danger' },
  expire: { label: '만료', variant: 'default' },
};

export default function PointsPage() {
  const [searchValue, setSearchValue] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredTransactions = transactions.filter(
    (t) => t.user.includes(searchValue) || t.id.includes(searchValue)
  ).filter(t => activeTab === 'all' || t.type === activeTab);

  const columns = [
    {
      key: 'id' as const,
      header: '거래번호',
      render: (item: typeof transactions[0]) => (
        <span className="font-mono text-purple-400">{item.id}</span>
      ),
    },
    {
      key: 'user' as const,
      header: '사용자',
      render: (item: typeof transactions[0]) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
            <span className="text-xs font-bold text-white">{item.user.charAt(0)}</span>
          </div>
          <span className="text-white font-medium">{item.user}</span>
        </div>
      ),
    },
    {
      key: 'type' as const,
      header: '유형',
      render: (item: typeof transactions[0]) => {
        const config = typeConfig[item.type as TransactionType];
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      key: 'amount' as const,
      header: '금액',
      render: (item: typeof transactions[0]) => (
        <span className={`font-semibold ${item.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()}P
        </span>
      ),
    },
    {
      key: 'balance' as const,
      header: '잔액',
      render: (item: typeof transactions[0]) => (
        <span className="text-gray-300">{item.balance.toLocaleString()}P</span>
      ),
    },
    {
      key: 'description' as const,
      header: '설명',
      render: (item: typeof transactions[0]) => (
        <span className="text-gray-400 text-sm">{item.description}</span>
      ),
    },
    {
      key: 'createdAt' as const,
      header: '일시',
      render: (item: typeof transactions[0]) => (
        <span className="text-gray-500 text-sm">{item.createdAt}</span>
      ),
    },
  ];

  const tabs = [
    { id: 'all', label: '전체' },
    { id: 'earn', label: '적립' },
    { id: 'spend', label: '사용' },
    { id: 'admin_grant', label: '지급' },
    { id: 'expire', label: '만료' },
  ];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">포인트 관리</h1>
          <p className="text-gray-400">사용자 포인트를 조회하고 관리합니다.</p>
        </div>
        <Button leftIcon={<PlusIcon />}>포인트 지급</Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="총 발행 포인트"
          value="1,234,567P"
          icon={<CoinsIcon />}
          color="purple"
        />
        <StatCard
          label="사용된 포인트"
          value="567,890P"
          subValue="46%"
          icon={<SpendIcon />}
          color="cyan"
        />
        <StatCard
          label="보유 포인트"
          value="666,677P"
          icon={<WalletIcon />}
          color="emerald"
        />
        <StatCard
          label="만료 예정"
          value="12,345P"
          subValue="7일 내"
          icon={<ClockIcon />}
          color="amber"
        />
      </div>

      {/* 검색 및 필터 */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          <SearchInput
            className="w-full md:w-80"
            placeholder="사용자 또는 거래번호 검색..."
            onSearch={setSearchValue}
          />
        </div>
      </Card>

      {/* 거래 목록 */}
      <DataGrid
        data={filteredTransactions}
        columns={columns}
        onRowClick={(item) => console.log('거래 클릭:', item)}
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
      {subValue && <div className="text-sm text-gray-400 mt-1">{subValue}</div>}
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

function CoinsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function SpendIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
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
