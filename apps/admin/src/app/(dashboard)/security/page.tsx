'use client';

import { useState } from 'react';
import { getBanTypeLabel, getAttackTypeLabel, formatRemainingTime } from '@auction/shared';
import {
  useSecurityStats,
  useBannedList,
  useSuspiciousList,
  useWhitelist,
  useBlacklist,
} from '@/features/security';

type TabType = 'banned' | 'suspicious' | 'whitelist' | 'blacklist';

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState<TabType>('banned');
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [banForm, setBanForm] = useState({ ip: '', reason: '', duration: '' });

  const { stats, loading: statsLoading, refresh: refreshStats } = useSecurityStats();
  const { bannedList, loading: bannedLoading, unban, ban, refresh: refreshBanned } = useBannedList();
  const { suspiciousList, loading: suspiciousLoading, clear: clearSuspicious, refresh: refreshSuspicious } = useSuspiciousList();
  const { whitelist, loading: whitelistLoading, add: addWhitelist, remove: removeWhitelist, refresh: refreshWhitelist } = useWhitelist();
  const { blacklist, loading: blacklistLoading, add: addBlacklist, remove: removeBlacklist, refresh: refreshBlacklist } = useBlacklist();

  const refreshAll = () => {
    refreshStats();
    refreshBanned();
    refreshSuspicious();
    refreshWhitelist();
    refreshBlacklist();
  };

  const handleBan = async () => {
    if (!banForm.ip || !banForm.reason) return;
    try {
      await ban({
        ip: banForm.ip,
        reason: banForm.reason,
        duration_seconds: banForm.duration ? parseInt(banForm.duration) * 60 : undefined,
      });
      setBanModalOpen(false);
      setBanForm({ ip: '', reason: '', duration: '' });
    } catch (err) {
      alert(err instanceof Error ? err.message : '차단에 실패했습니다');
    }
  };

  const handleUnban = async (ip: string) => {
    if (!confirm(`${ip}의 차단을 해제하시겠습니까?`)) return;
    try {
      await unban(ip);
    } catch (err) {
      alert(err instanceof Error ? err.message : '차단 해제에 실패했습니다');
    }
  };

  const handleClearSuspicious = async (ip: string) => {
    if (!confirm(`${ip}의 의심 활동 기록을 삭제하시겠습니까?`)) return;
    try {
      await clearSuspicious(ip);
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제에 실패했습니다');
    }
  };

  const handleAddWhitelist = async () => {
    const ip = prompt('화이트리스트에 추가할 IP를 입력하세요');
    if (!ip) return;
    try {
      await addWhitelist(ip);
    } catch (err) {
      alert(err instanceof Error ? err.message : '추가에 실패했습니다');
    }
  };

  const handleRemoveWhitelist = async (ip: string) => {
    if (!confirm(`${ip}를 화이트리스트에서 제거하시겠습니까?`)) return;
    try {
      await removeWhitelist(ip);
    } catch (err) {
      alert(err instanceof Error ? err.message : '제거에 실패했습니다');
    }
  };

  const handleAddBlacklist = async () => {
    const ip = prompt('블랙리스트에 추가할 IP를 입력하세요 (영구 차단)');
    if (!ip) return;
    const reason = prompt('차단 사유를 입력하세요') || '수동 블랙리스트 등록';
    try {
      await addBlacklist(ip, reason);
      refreshBanned();
    } catch (err) {
      alert(err instanceof Error ? err.message : '추가에 실패했습니다');
    }
  };

  const handleRemoveBlacklist = async (ip: string) => {
    if (!confirm(`${ip}를 블랙리스트에서 제거하시겠습니까?`)) return;
    try {
      await removeBlacklist(ip);
      refreshBanned();
    } catch (err) {
      alert(err instanceof Error ? err.message : '제거에 실패했습니다');
    }
  };

  const tabs: { id: TabType; label: string; count: number }[] = [
    { id: 'banned', label: '차단된 IP', count: bannedList.length },
    { id: 'suspicious', label: '의심 활동', count: suspiciousList.length },
    { id: 'whitelist', label: '화이트리스트', count: whitelist.length },
    { id: 'blacklist', label: '블랙리스트', count: blacklist.length },
  ];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">보안 관리</h1>
          <p className="text-gray-400">IP 차단 및 보안 설정을 관리합니다.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refreshAll}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
          >
            새로고침
          </button>
          <button
            onClick={() => setBanModalOpen(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-colors"
          >
            IP 차단
          </button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="총 차단 IP"
          value={stats?.total_banned ?? 0}
          loading={statsLoading}
          color="red"
        />
        <StatCard
          label="영구 차단"
          value={stats?.permanent_banned ?? 0}
          loading={statsLoading}
          color="purple"
        />
        <StatCard
          label="의심 활동"
          value={stats?.suspicious_ips ?? 0}
          loading={statsLoading}
          color="yellow"
        />
        <StatCard
          label="화이트리스트"
          value={stats?.whitelist_count ?? 0}
          loading={statsLoading}
          color="green"
        />
      </div>

      {/* 탭 */}
      <div className="border-b border-white/10">
        <nav className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
              <span className="ml-2 px-2 py-0.5 text-xs bg-slate-700 rounded-full">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="rounded-2xl bg-slate-800/50 border border-white/5">
        {activeTab === 'banned' && (
          <BannedListContent
            list={bannedList}
            loading={bannedLoading}
            onUnban={handleUnban}
          />
        )}
        {activeTab === 'suspicious' && (
          <SuspiciousListContent
            list={suspiciousList}
            loading={suspiciousLoading}
            onClear={handleClearSuspicious}
            onBan={(ip) => {
              setBanForm({ ip, reason: '의심 활동으로 인한 수동 차단', duration: '' });
              setBanModalOpen(true);
            }}
          />
        )}
        {activeTab === 'whitelist' && (
          <IPListContent
            title="화이트리스트"
            list={whitelist}
            loading={whitelistLoading}
            onAdd={handleAddWhitelist}
            onRemove={handleRemoveWhitelist}
            emptyMessage="화이트리스트가 비어 있습니다"
          />
        )}
        {activeTab === 'blacklist' && (
          <IPListContent
            title="블랙리스트"
            list={blacklist}
            loading={blacklistLoading}
            onAdd={handleAddBlacklist}
            onRemove={handleRemoveBlacklist}
            emptyMessage="블랙리스트가 비어 있습니다"
          />
        )}
      </div>

      {/* 차단 모달 */}
      {banModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">IP 차단</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">IP 주소</label>
                <input
                  type="text"
                  value={banForm.ip}
                  onChange={(e) => setBanForm({ ...banForm, ip: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  placeholder="192.168.1.1"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">차단 사유</label>
                <input
                  type="text"
                  value={banForm.reason}
                  onChange={(e) => setBanForm({ ...banForm, reason: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  placeholder="차단 사유를 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">차단 시간 (분, 비우면 영구)</label>
                <input
                  type="number"
                  value={banForm.duration}
                  onChange={(e) => setBanForm({ ...banForm, duration: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                  placeholder="60"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setBanModalOpen(false)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleBan}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-colors"
              >
                차단
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 통계 카드 컴포넌트
function StatCard({ label, value, loading, color }: {
  label: string;
  value: number;
  loading: boolean;
  color: 'red' | 'yellow' | 'green' | 'purple';
}) {
  const colorClasses = {
    red: 'from-red-500/10 to-red-500/5 border-red-500/20 text-red-400',
    yellow: 'from-yellow-500/10 to-yellow-500/5 border-yellow-500/20 text-yellow-400',
    green: 'from-green-500/10 to-green-500/5 border-green-500/20 text-green-400',
    purple: 'from-purple-500/10 to-purple-500/5 border-purple-500/20 text-purple-400',
  };

  return (
    <div className={`rounded-2xl bg-gradient-to-br ${colorClasses[color]} border p-6`}>
      <p className="text-sm text-gray-400 mb-1">{label}</p>
      {loading ? (
        <div className="h-8 w-16 bg-slate-700 rounded animate-pulse" />
      ) : (
        <p className={`text-3xl font-bold ${colorClasses[color].split(' ').pop()}`}>
          {value}
        </p>
      )}
    </div>
  );
}

// 차단 목록 컨텐츠
function BannedListContent({ list, loading, onUnban }: {
  list: Array<{
    ip: string;
    ban_type: 'auto' | 'manual' | 'blacklist';
    reason: string;
    banned_at: string;
    is_permanent: boolean;
    remaining_seconds: number | null;
    suspicious_count: number;
    last_attack_type: string | null;
  }>;
  loading: boolean;
  onUnban: (ip: string) => void;
}) {
  if (loading) {
    return <LoadingState />;
  }

  if (list.length === 0) {
    return <EmptyState message="차단된 IP가 없습니다" />;
  }

  return (
    <div className="divide-y divide-white/5">
      {list.map((item) => (
        <div key={item.ip} className="p-4 hover:bg-white/5 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${
                item.is_permanent ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              <div>
                <p className="font-mono text-white">{item.ip}</p>
                <p className="text-sm text-gray-400">{item.reason}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    item.ban_type === 'auto' ? 'bg-yellow-500/20 text-yellow-400' :
                    item.ban_type === 'manual' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {getBanTypeLabel(item.ban_type)}
                  </span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {item.is_permanent ? '영구 차단' : formatRemainingTime(item.remaining_seconds)}
                </p>
              </div>
              {item.ban_type !== 'blacklist' && (
                <button
                  onClick={() => onUnban(item.ip)}
                  className="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  해제
                </button>
              )}
            </div>
          </div>
          {item.last_attack_type && (
            <div className="mt-2 flex gap-2 text-xs">
              <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded">
                {getAttackTypeLabel(item.last_attack_type)}
              </span>
              <span className="text-gray-500">
                의심 활동 {item.suspicious_count}회
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// 의심 활동 목록 컨텐츠
function SuspiciousListContent({ list, loading, onClear, onBan }: {
  list: Array<{
    ip: string;
    count: number;
    first_seen: string | null;
    last_seen: string | null;
    attack_types: string[];
  }>;
  loading: boolean;
  onClear: (ip: string) => void;
  onBan: (ip: string) => void;
}) {
  if (loading) {
    return <LoadingState />;
  }

  if (list.length === 0) {
    return <EmptyState message="의심 활동이 없습니다" />;
  }

  return (
    <div className="divide-y divide-white/5">
      {list.map((item) => (
        <div key={item.ip} className="p-4 hover:bg-white/5 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-white">{item.ip}</p>
              <p className="text-sm text-gray-400">
                의심 활동 {item.count}회
                {item.last_seen && ` • 마지막: ${formatDateShort(item.last_seen)}`}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onBan(item.ip)}
                className="px-3 py-1 text-sm bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
              >
                차단
              </button>
              <button
                onClick={() => onClear(item.ip)}
                className="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                기록 삭제
              </button>
            </div>
          </div>
          {item.attack_types.length > 0 && (
            <div className="mt-2 flex gap-2 flex-wrap">
              {item.attack_types.map((type) => (
                <span key={type} className="px-2 py-0.5 text-xs bg-orange-500/20 text-orange-400 rounded">
                  {getAttackTypeLabel(type)}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// IP 목록 (화이트리스트/블랙리스트)
function IPListContent({ title, list, loading, onAdd, onRemove, emptyMessage }: {
  title: string;
  list: string[];
  loading: boolean;
  onAdd: () => void;
  onRemove: (ip: string) => void;
  emptyMessage: string;
}) {
  if (loading) {
    return <LoadingState />;
  }

  return (
    <div>
      <div className="p-4 border-b border-white/5">
        <button
          onClick={onAdd}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-colors"
        >
          {title}에 추가
        </button>
      </div>
      {list.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <div className="divide-y divide-white/5">
          {list.map((ip) => (
            <div key={ip} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
              <p className="font-mono text-white">{ip}</p>
              <button
                onClick={() => onRemove(ip)}
                className="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                제거
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 로딩 상태
function LoadingState() {
  return (
    <div className="p-8 text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent" />
      <p className="mt-4 text-gray-400">로딩 중...</p>
    </div>
  );
}

// 빈 상태
function EmptyState({ message }: { message: string }) {
  return (
    <div className="p-8 text-center">
      <p className="text-gray-400">{message}</p>
    </div>
  );
}

// 유틸리티 함수 (간결한 날짜 포맷 - 테이블용)
function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
