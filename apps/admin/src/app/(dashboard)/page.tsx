import Link from 'next/link';

// 데모용 통계 데이터
const stats = {
  users: { total: 1234, newToday: 23, newThisWeek: 156 },
  products: { total: 567, active: 234, endedToday: 12 },
  payments: { todayTotal: 1234567, todayCount: 45, monthTotal: 34567890 },
  visitors: { today: 890, current: 34 },
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-white">대시보드</h1>
        <p className="text-gray-400">Auction 관리 현황을 한눈에 확인하세요.</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* 총 사용자 */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 p-6 transition-all hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -mr-10 -mt-10"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-400">총 사용자</span>
              <div className="p-2 bg-purple-500/20 rounded-xl">
                <UsersIcon className="h-5 w-5 text-purple-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats.users.total.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-green-400">+{stats.users.newToday}</span>
              <span className="text-gray-500">오늘 가입</span>
            </div>
          </div>
        </div>

        {/* 진행중인 경매 */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 p-6 transition-all hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/10">
          <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-full -mr-10 -mt-10"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-400">진행중인 경매</span>
              <div className="p-2 bg-cyan-500/20 rounded-xl">
                <PackageIcon className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {stats.products.active.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-gray-400">총 {stats.products.total}개</span>
              <span className="text-gray-500">상품</span>
            </div>
          </div>
        </div>

        {/* 오늘 매출 */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 p-6 transition-all hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full -mr-10 -mt-10"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-400">오늘 매출</span>
              <div className="p-2 bg-emerald-500/20 rounded-xl">
                <CreditCardIcon className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {(stats.payments.todayTotal / 10000).toFixed(0)}
              <span className="text-lg text-gray-400 ml-1">만원</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-emerald-400">{stats.payments.todayCount}건</span>
              <span className="text-gray-500">결제 완료</span>
            </div>
          </div>
        </div>

        {/* 현재 접속자 */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 p-6 transition-all hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/10">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full -mr-10 -mt-10"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-400">현재 접속자</span>
              <div className="p-2 bg-amber-500/20 rounded-xl">
                <ActivityIcon className="h-5 w-5 text-amber-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-1 flex items-center gap-2">
              {stats.visitors.current}
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-gray-400">오늘 {stats.visitors.today}명</span>
              <span className="text-gray-500">방문</span>
            </div>
          </div>
        </div>
      </div>

      {/* 빠른 액션 */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">빠른 액션</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/products" className="group">
            <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-6 transition-all hover:bg-slate-800 hover:border-white/10 hover:shadow-xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/20 rounded-xl group-hover:bg-purple-500/30 transition-colors">
                  <PackageIcon className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white group-hover:text-purple-300 transition-colors">상품 관리</h3>
                  <p className="text-sm text-gray-500">경매 상품 등록, 수정, 상태 관리</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/payments" className="group">
            <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-6 transition-all hover:bg-slate-800 hover:border-white/10 hover:shadow-xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/20 rounded-xl group-hover:bg-emerald-500/30 transition-colors">
                  <CreditCardIcon className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white group-hover:text-emerald-300 transition-colors">결제 내역</h3>
                  <p className="text-sm text-gray-500">결제 확인, 환불 처리</p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/banners" className="group">
            <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-6 transition-all hover:bg-slate-800 hover:border-white/10 hover:shadow-xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-500/20 rounded-xl group-hover:bg-cyan-500/30 transition-colors">
                  <ImageIcon className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white group-hover:text-cyan-300 transition-colors">배너 관리</h3>
                  <p className="text-sm text-gray-500">메인 배너 등록 및 노출 관리</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* 최근 활동 */}
      <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">최근 활동</h2>
        <div className="space-y-4">
          {[
            { action: '새 상품 등록', user: 'admin1', time: '방금 전', icon: PackageIcon, color: 'purple' },
            { action: '결제 승인', user: 'system', time: '5분 전', icon: CreditCardIcon, color: 'emerald' },
            { action: '회원 가입', user: 'user123', time: '10분 전', icon: UsersIcon, color: 'cyan' },
            { action: '배너 수정', user: 'admin2', time: '30분 전', icon: ImageIcon, color: 'amber' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
              <div className={`p-2 bg-${item.color}-500/20 rounded-lg`}>
                <item.icon className={`h-4 w-4 text-${item.color}-400`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-white">{item.action}</p>
                <p className="text-xs text-gray-500">{item.user}</p>
              </div>
              <span className="text-xs text-gray-500">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 아이콘 컴포넌트
function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function PackageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}

function ActivityIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
