'use client';

import { Card } from '@/components/ui';

// 데모용 통계 데이터
const stats = {
  today: 890,
  week: 5234,
  month: 21456,
  current: 34,
};

const dailyData = [
  { date: '12/14', visitors: 756, pageViews: 2340, uniqueUsers: 650 },
  { date: '12/15', visitors: 823, pageViews: 2567, uniqueUsers: 712 },
  { date: '12/16', visitors: 912, pageViews: 2890, uniqueUsers: 801 },
  { date: '12/17', visitors: 678, pageViews: 1987, uniqueUsers: 589 },
  { date: '12/18', visitors: 845, pageViews: 2654, uniqueUsers: 734 },
  { date: '12/19', visitors: 934, pageViews: 3012, uniqueUsers: 823 },
  { date: '12/20', visitors: 890, pageViews: 2876, uniqueUsers: 778 },
];

const topPages = [
  { path: '/', views: 4567, percentage: 35 },
  { path: '/products', views: 2345, percentage: 18 },
  { path: '/products/123', views: 1234, percentage: 10 },
  { path: '/auth/login', views: 890, percentage: 7 },
  { path: '/my/bids', views: 678, percentage: 5 },
];

const deviceStats = [
  { device: '모바일', percentage: 58, color: 'purple' },
  { device: '데스크톱', percentage: 35, color: 'cyan' },
  { device: '태블릿', percentage: 7, color: 'amber' },
];

export default function VisitorsPage() {
  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-white">접속자 통계</h1>
        <p className="text-gray-400">방문자 현황을 분석합니다.</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="오늘 방문자"
          value={stats.today.toLocaleString()}
          subValue="+12% 어제 대비"
          positive
          icon={<UsersIcon />}
          color="purple"
        />
        <StatCard
          label="이번 주 방문자"
          value={stats.week.toLocaleString()}
          subValue="+8% 지난 주 대비"
          positive
          icon={<CalendarIcon />}
          color="cyan"
        />
        <StatCard
          label="이번 달 방문자"
          value={stats.month.toLocaleString()}
          subValue="목표 25,000"
          icon={<ChartIcon />}
          color="emerald"
        />
        <StatCard
          label="현재 접속자"
          value={stats.current.toString()}
          subValue="실시간"
          live
          icon={<ActivityIcon />}
          color="amber"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 일별 통계 */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-white mb-6">일별 방문자 추이</h2>
          <div className="space-y-4">
            {dailyData.map((day) => (
              <div key={day.date} className="flex items-center gap-4">
                <span className="w-12 text-sm text-gray-400">{day.date}</span>
                <div className="flex-1">
                  <div className="h-6 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-500"
                      style={{ width: `${(day.visitors / 1000) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="w-16 text-sm text-right font-medium text-white">{day.visitors}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* 인기 페이지 */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-white mb-6">인기 페이지</h2>
          <div className="space-y-4">
            {topPages.map((page, index) => (
              <div key={page.path} className="flex items-center gap-4">
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                  index === 0 ? 'bg-amber-500/20 text-amber-400' :
                  index === 1 ? 'bg-slate-500/20 text-slate-300' :
                  index === 2 ? 'bg-orange-500/20 text-orange-400' :
                  'bg-slate-700/50 text-gray-500'
                }`}>
                  {index + 1}
                </span>
                <span className="flex-1 text-sm font-mono text-gray-300 truncate">{page.path}</span>
                <span className="w-16 text-sm text-right text-gray-400">{page.views.toLocaleString()}</span>
                <span className="w-12 text-sm text-right font-medium text-purple-400">{page.percentage}%</span>
              </div>
            ))}
          </div>
        </Card>

        {/* 디바이스 통계 */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-white mb-6">디바이스별 접속</h2>
          <div className="space-y-6">
            {deviceStats.map((device) => (
              <div key={device.device}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">{device.device}</span>
                  <span className="text-sm font-medium text-white">{device.percentage}%</span>
                </div>
                <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      device.color === 'purple' ? 'bg-purple-500' :
                      device.color === 'cyan' ? 'bg-cyan-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${device.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 실시간 활동 */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-lg font-semibold text-white">실시간 활동</h2>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          </div>
          <div className="space-y-3">
            {[
              { action: '상품 조회', user: '익명 사용자', time: '방금 전', page: '/products/빈티지-시계' },
              { action: '입찰 참여', user: '홍길동', time: '1분 전', page: '/products/골프-클럽' },
              { action: '로그인', user: '김철수', time: '2분 전', page: '/auth/login' },
              { action: '상품 등록', user: '이영희', time: '5분 전', page: '/products/new' },
              { action: '검색', user: '익명 사용자', time: '7분 전', page: '/?q=명품' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <ActivityIcon className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium">{item.action}</p>
                  <p className="text-xs text-gray-500 truncate">{item.page}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{item.user}</p>
                  <p className="text-xs text-gray-500">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// 통계 카드 컴포넌트
function StatCard({
  label,
  value,
  subValue,
  positive,
  live,
  icon,
  color,
}: {
  label: string;
  value: string;
  subValue?: string;
  positive?: boolean;
  live?: boolean;
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
      <div className="text-3xl font-bold text-white flex items-center gap-2">
        {value}
        {live && (
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        )}
      </div>
      {subValue && (
        <div className={`text-sm mt-1 ${positive ? 'text-emerald-400' : 'text-gray-400'}`}>
          {subValue}
        </div>
      )}
    </div>
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

function ActivityIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}
