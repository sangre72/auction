'use client';

import { useState } from 'react';
import { Button, SearchInput, Badge, Card, DataGrid, Tooltip, Tabs, Alert } from '@/components/ui';

// 데모용 결제 데이터
const payments = [
  { id: 'P001', user: '홍길동', product: '빈티지 시계', amount: 150000, method: 'card', status: 'completed', createdAt: '2025-12-20 14:30' },
  { id: 'P002', user: '김철수', product: '골프 클럽 세트', amount: 800000, method: 'bank_transfer', status: 'pending', createdAt: '2025-12-20 13:15' },
  { id: 'P003', user: '이영희', product: '명품 가방', amount: 2500000, method: 'card', status: 'completed', createdAt: '2025-12-20 11:45' },
  { id: 'P004', user: '박민수', product: '전자기기 세트', amount: 450000, method: 'point', status: 'refunded', createdAt: '2025-12-19 16:20' },
  { id: 'P005', user: '최예술', product: '그림 작품', amount: 5000000, method: 'card', status: 'failed', createdAt: '2025-12-19 10:00' },
];

type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
type PaymentMethod = 'card' | 'bank_transfer' | 'point' | 'mixed';

const statusConfig: Record<PaymentStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' }> = {
  pending: { label: '대기중', variant: 'warning' },
  completed: { label: '완료', variant: 'success' },
  failed: { label: '실패', variant: 'danger' },
  refunded: { label: '환불', variant: 'default' },
};

const methodLabels: Record<PaymentMethod, string> = {
  card: '카드',
  bank_transfer: '계좌이체',
  point: '포인트',
  mixed: '혼합',
};

export default function PaymentsPage() {
  const [searchValue, setSearchValue] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showAlert, setShowAlert] = useState(true);

  const filteredPayments = payments.filter(
    (p) => p.user.includes(searchValue) || p.product.includes(searchValue) || p.id.includes(searchValue)
  ).filter(p => activeTab === 'all' || p.status === activeTab);

  const columns = [
    {
      key: 'id' as const,
      header: '결제번호',
      render: (item: typeof payments[0]) => (
        <span className="font-mono text-purple-400">{item.id}</span>
      ),
    },
    {
      key: 'user' as const,
      header: '구매자',
      render: (item: typeof payments[0]) => (
        <span className="text-white font-medium">{item.user}</span>
      ),
    },
    {
      key: 'product' as const,
      header: '상품',
    },
    {
      key: 'amount' as const,
      header: '금액',
      render: (item: typeof payments[0]) => (
        <span className="text-emerald-400 font-semibold">
          {item.amount.toLocaleString()}원
        </span>
      ),
    },
    {
      key: 'method' as const,
      header: '결제방법',
      render: (item: typeof payments[0]) => (
        <div className="flex items-center gap-2">
          <MethodIcon method={item.method as PaymentMethod} />
          <span className="text-gray-300">{methodLabels[item.method as PaymentMethod]}</span>
        </div>
      ),
    },
    {
      key: 'status' as const,
      header: '상태',
      render: (item: typeof payments[0]) => {
        const config = statusConfig[item.status as PaymentStatus];
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      key: 'createdAt' as const,
      header: '일시',
      render: (item: typeof payments[0]) => (
        <span className="text-gray-500 text-sm">{item.createdAt}</span>
      ),
    },
    {
      key: 'actions' as const,
      header: '관리',
      render: (item: typeof payments[0]) => (
        <div className="flex gap-2">
          <Tooltip content="상세 보기">
            <Button variant="ghost" size="sm">상세</Button>
          </Tooltip>
          {item.status === 'completed' && (
            <Tooltip content="환불 처리">
              <Button variant="ghost" size="sm" className="text-red-400">환불</Button>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  const tabs = [
    { id: 'all', label: '전체' },
    { id: 'completed', label: '완료' },
    { id: 'pending', label: '대기중' },
    { id: 'refunded', label: '환불' },
  ];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-white">결제 관리</h1>
        <p className="text-gray-400">결제 내역을 조회하고 관리합니다.</p>
      </div>

      {/* 환불 대기 알림 */}
      {showAlert && (
        <Alert variant="warning" title="환불 요청" onClose={() => setShowAlert(false)}>
          대기 중인 환불 요청이 2건 있습니다. 확인해 주세요.
        </Alert>
      )}

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="오늘 매출"
          value="345만원"
          subValue="+12.5% 어제 대비"
          icon={<CurrencyIcon />}
          color="emerald"
        />
        <StatCard
          label="이번 주"
          value="1,234만원"
          icon={<CalendarIcon />}
          color="purple"
        />
        <StatCard
          label="이번 달"
          value="5,678만원"
          icon={<ChartIcon />}
          color="cyan"
        />
        <StatCard
          label="환불 대기"
          value="3건"
          subValue="45만원"
          icon={<RefundIcon />}
          color="amber"
        />
      </div>

      {/* 검색 및 필터 */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          <div className="flex gap-2">
            <SearchInput
              className="w-80"
              placeholder="구매자, 상품, 결제번호 검색..."
              onSearch={setSearchValue}
            />
            <Button variant="outline" leftIcon={<DownloadIcon />}>
              내보내기
            </Button>
          </div>
        </div>
      </Card>

      {/* 결제 목록 */}
      <DataGrid
        data={filteredPayments}
        columns={columns}
        onRowClick={(item) => console.log('결제 클릭:', item)}
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

// 결제 방법 아이콘
function MethodIcon({ method }: { method: PaymentMethod }) {
  if (method === 'card') {
    return (
      <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    );
  }
  if (method === 'bank_transfer') {
    return (
      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    );
  }
  if (method === 'point') {
    return (
      <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

// 아이콘 컴포넌트
function CurrencyIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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

function RefundIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}
