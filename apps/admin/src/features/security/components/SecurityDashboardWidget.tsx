'use client';

import Link from 'next/link';
import { useSecurityStats, useBannedList } from '../hooks/useSecurity';
import { getBanTypeLabel, getAttackTypeLabel, formatRemainingTime } from '@auction/shared';

export function SecurityDashboardWidget() {
  const { stats, loading: statsLoading } = useSecurityStats();
  const { bannedList, loading: listLoading } = useBannedList();

  const loading = statsLoading || listLoading;

  // 최근 5개만 표시
  const recentBanned = bannedList.slice(0, 5);

  return (
    <div className="rounded-2xl bg-slate-800/50 border border-white/5 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <ShieldIcon className="h-5 w-5 text-red-400" />
          보안 현황
        </h2>
        <Link
          href="/security"
          className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          전체 보기 →
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-16 mb-2" />
                <div className="h-8 bg-slate-700 rounded w-12" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* 통계 */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-red-500/10 rounded-xl border border-red-500/20">
              <p className="text-2xl font-bold text-red-400">
                {stats?.total_banned ?? 0}
              </p>
              <p className="text-xs text-gray-400">차단된 IP</p>
            </div>
            <div className="text-center p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
              <p className="text-2xl font-bold text-yellow-400">
                {stats?.suspicious_ips ?? 0}
              </p>
              <p className="text-xs text-gray-400">의심 활동</p>
            </div>
            <div className="text-center p-3 bg-green-500/10 rounded-xl border border-green-500/20">
              <p className="text-2xl font-bold text-green-400">
                {stats?.whitelist_count ?? 0}
              </p>
              <p className="text-xs text-gray-400">화이트리스트</p>
            </div>
          </div>

          {/* 최근 차단 목록 */}
          {recentBanned.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-400 mb-3">최근 차단된 IP</p>
              {recentBanned.map((item) => (
                <div
                  key={item.ip}
                  className="flex items-center justify-between p-3 bg-slate-700/50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      item.is_permanent ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <div>
                      <p className="text-sm font-mono text-white">{item.ip}</p>
                      <p className="text-xs text-gray-500">
                        {getBanTypeLabel(item.ban_type)}
                        {item.last_attack_type && ` • ${getAttackTypeLabel(item.last_attack_type)}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {item.is_permanent ? (
                      <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">
                        영구
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">
                        {formatRemainingTime(item.remaining_seconds)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircleIcon className="h-12 w-12 text-green-400 mx-auto mb-2" />
              <p className="text-gray-400">현재 차단된 IP가 없습니다</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
