'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Badge, Card } from '@/components/ui';
import { usersApi } from '@/lib/api';
import type { User, UserStatus, UserProvider } from '@/lib/api';

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

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = Number(params.id);

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await usersApi.getById(userId);
      setUser(response.data);
    } catch (err) {
      console.error('사용자 조회 실패:', err);
      setError('사용자를 찾을 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId, fetchUser]);

  const handleStatusChange = async (action: 'suspend' | 'activate' | 'ban' | 'set-inactive' | 'delete') => {
    if (!user) return;

    const confirmMessages: Record<string, string> = {
      suspend: '이 사용자를 정지하시겠습니까?',
      activate: '이 사용자를 활성화하시겠습니까?',
      ban: '이 사용자를 영구 차단하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      'set-inactive': '이 사용자를 휴면 처리하시겠습니까?',
      delete: '이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
    };

    if (!confirm(confirmMessages[action])) return;

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
        case 'delete':
          await usersApi.delete(userId);
          router.push('/users');
          return;
      }
      fetchUser();
    } catch (err) {
      console.error('상태 변경 실패:', err);
      alert('상태 변경에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/users">
            <Button variant="ghost" size="sm">
              <ArrowLeftIcon />
              <span className="ml-2">목록으로</span>
            </Button>
          </Link>
        </div>
        <Card className="p-8">
          <div className="text-center text-gray-400">{error || '사용자를 찾을 수 없습니다.'}</div>
        </Card>
      </div>
    );
  }

  const statusInfo = statusConfig[user.status];
  const providerInfo = providerConfig[user.provider];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/users">
            <Button variant="ghost" size="sm">
              <ArrowLeftIcon />
              <span className="ml-2">목록으로</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">사용자 상세</h1>
            <p className="text-gray-400">사용자 정보를 확인하고 관리합니다.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 기본 정보 */}
        <Card className="lg:col-span-2 p-6">
          <h2 className="text-lg font-semibold text-white mb-6">기본 정보</h2>

          <div className="flex items-start gap-6 mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
              {user.profile_image ? (
                <img
                  src={user.profile_image}
                  alt={user.nickname || user.name || '사용자'}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-white">
                  {(user.nickname || user.name || 'U').charAt(0)}
                </span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-white">
                  {user.nickname || user.name || '-'}
                </h3>
                <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                {user.is_verified && (
                  <span className="text-emerald-400 flex items-center gap-1 text-sm">
                    <VerifiedIcon />
                    인증됨
                  </span>
                )}
              </div>
              <p className="text-gray-400">{user.email || '-'}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <InfoRow label="ID" value={`#${user.id}`} />
            <InfoRow label="이름" value={user.name || '-'} />
            <InfoRow label="닉네임" value={user.nickname || '-'} />
            <InfoRow label="이메일" value={user.email || '-'} />
            <InfoRow label="전화번호" value={user.phone || '-'} />
            <InfoRow
              label="가입 방식"
              value={
                <div className="flex items-center gap-2">
                  <ProviderIcon provider={user.provider} />
                  <Badge variant={providerInfo.variant}>{providerInfo.label}</Badge>
                </div>
              }
            />
            <InfoRow
              label="인증 레벨"
              value={
                user.verification_level === 'none' ? '미인증' :
                user.verification_level === 'email' ? '이메일 인증' :
                user.verification_level === 'phone' ? '휴대폰 인증' :
                user.verification_level === 'identity' ? '본인 인증' : '-'
              }
            />
            <InfoRow
              label="포인트 잔액"
              value={
                <span className="text-cyan-400 font-medium">
                  {user.point_balance.toLocaleString()}P
                </span>
              }
            />
            <InfoRow
              label="최근 로그인"
              value={user.last_login_at ? new Date(user.last_login_at).toLocaleString('ko-KR') : '-'}
            />
            <InfoRow
              label="가입일"
              value={new Date(user.created_at).toLocaleString('ko-KR')}
            />
          </div>
        </Card>

        {/* 상태 관리 */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-white mb-6">상태 관리</h2>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700">
              <div className="text-sm text-gray-400 mb-1">현재 상태</div>
              <Badge variant={statusInfo.variant} className="text-base">
                {statusInfo.label}
              </Badge>
            </div>

            <div className="space-y-2">
              {user.status === 'active' && (
                <>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-amber-400 border-amber-400/30 hover:bg-amber-400/10"
                    onClick={() => handleStatusChange('suspend')}
                  >
                    <PauseIcon />
                    <span className="ml-2">계정 정지</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-gray-400 border-gray-500/30 hover:bg-gray-500/10"
                    onClick={() => handleStatusChange('set-inactive')}
                  >
                    <SleepIcon />
                    <span className="ml-2">휴면 처리</span>
                  </Button>
                </>
              )}

              {user.status === 'suspended' && (
                <Button
                  variant="outline"
                  className="w-full justify-start text-emerald-400 border-emerald-400/30 hover:bg-emerald-400/10"
                  onClick={() => handleStatusChange('activate')}
                >
                  <PlayIcon />
                  <span className="ml-2">정지 해제</span>
                </Button>
              )}

              {user.status === 'inactive' && (
                <Button
                  variant="outline"
                  className="w-full justify-start text-emerald-400 border-emerald-400/30 hover:bg-emerald-400/10"
                  onClick={() => handleStatusChange('activate')}
                >
                  <PlayIcon />
                  <span className="ml-2">활성화</span>
                </Button>
              )}

              {user.status === 'banned' && (
                <Button
                  variant="outline"
                  className="w-full justify-start text-emerald-400 border-emerald-400/30 hover:bg-emerald-400/10"
                  onClick={() => handleStatusChange('activate')}
                >
                  <PlayIcon />
                  <span className="ml-2">차단 해제</span>
                </Button>
              )}

              {(user.status === 'active' || user.status === 'suspended') && (
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-400 border-red-400/30 hover:bg-red-400/10"
                  onClick={() => handleStatusChange('ban')}
                >
                  <BanIcon />
                  <span className="ml-2">영구 차단</span>
                </Button>
              )}

              {user.status !== 'deleted' && (
                <div className="pt-4 border-t border-gray-700">
                  <Button
                    variant="danger"
                    className="w-full"
                    onClick={() => handleStatusChange('delete')}
                  >
                    <TrashIcon />
                    <span className="ml-2">사용자 삭제</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-white">{value}</span>
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
function ArrowLeftIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
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

function PauseIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function SleepIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  );
}

function BanIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}
