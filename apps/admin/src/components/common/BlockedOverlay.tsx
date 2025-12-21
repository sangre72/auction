'use client';

import { useEffect, useState } from 'react';
import { getBlockStatus, clearBlocked } from '@/lib/security';

export function BlockedOverlay() {
  const [status, setStatus] = useState<{
    isBlocked: boolean;
    message: string | null;
    retryAfter: number | null;
    formattedRetryAfter: string | null;
  }>({ isBlocked: false, message: null, retryAfter: null, formattedRetryAfter: null });

  useEffect(() => {
    // 초기 상태 확인
    setStatus(getBlockStatus());

    // 1초마다 상태 업데이트
    const interval = setInterval(() => {
      const newStatus = getBlockStatus();
      setStatus(newStatus);

      // 차단 해제되면 인터벌 정리
      if (!newStatus.isBlocked) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!status.isBlocked) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        {/* 경고 아이콘 */}
        <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
          <svg
            className="w-10 h-10 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* 제목 */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          일시적으로 접근이 제한되었습니다
        </h2>

        {/* 메시지 */}
        <p className="text-gray-600 mb-6">
          {status.message || '잠시 후 다시 시도해주세요.'}
        </p>

        {/* 남은 시간 */}
        {status.formattedRetryAfter && (
          <div className="bg-gray-100 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">다시 시도 가능 시간</p>
            <p className="text-2xl font-bold text-purple-600">
              {status.formattedRetryAfter}
            </p>
          </div>
        )}

        {/* 안내 */}
        <p className="text-sm text-gray-400">
          문제가 계속되면 관리자에게 문의해주세요.
        </p>

        {/* 새로고침 버튼 */}
        <button
          onClick={() => {
            clearBlocked();
            window.location.reload();
          }}
          className="mt-6 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors"
        >
          새로고침
        </button>
      </div>
    </div>
  );
}
