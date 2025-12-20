'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '../lib/utils';

interface SessionTimeoutModalProps {
  /** 경고 모달 표시 여부 */
  isWarningOpen: boolean;
  /** 로그아웃 완료 모달 표시 여부 */
  isLogoutCompleteOpen: boolean;
  /** 남은 시간 (초) */
  remainingSeconds: number;
  /** 비활동 타임아웃 (분) - 메시지 표시용 */
  inactivityMinutes?: number;
  /** 연장 버튼 클릭 */
  onExtend: () => void;
  /** 로그아웃 버튼 클릭 */
  onLogout: () => void;
  /** 로그아웃 완료 모달 닫기 */
  onDismiss: () => void;
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export function SessionTimeoutModal({
  isWarningOpen,
  isLogoutCompleteOpen,
  remainingSeconds,
  inactivityMinutes = 15,
  onExtend,
  onLogout,
  onDismiss,
}: SessionTimeoutModalProps) {
  return (
    <>
      {/* 경고 모달 */}
      <Dialog.Root open={isWarningOpen}>
        <Dialog.Portal>
          <Dialog.Overlay
            className={cn(
              'fixed inset-0 bg-black/60 backdrop-blur-sm z-50',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
            )}
          />
          <Dialog.Content
            className={cn(
              'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2',
              'bg-white rounded-2xl shadow-2xl p-0 overflow-hidden',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
              'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
              'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
              'duration-200'
            )}
            onEscapeKeyDown={(e) => e.preventDefault()}
            onPointerDownOutside={(e) => e.preventDefault()}
          >
            {/* 헤더 */}
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-amber-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <Dialog.Title className="text-xl font-bold text-gray-900 text-center">
                세션 만료 안내
              </Dialog.Title>
              <Dialog.Description className="text-gray-500 text-center mt-2">
                {inactivityMinutes}분간 활동이 없어 세션이 만료됩니다.
                <br />
                계속 사용하시려면 연장 버튼을 클릭해주세요.
              </Dialog.Description>
            </div>

            {/* 카운트다운 */}
            <div className="px-6 pb-4">
              <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-100">
                <p className="text-sm text-amber-700 mb-1">남은 시간</p>
                <p className="text-3xl font-bold text-amber-600 font-mono">
                  {formatTime(remainingSeconds)}
                </p>
              </div>
            </div>

            {/* 버튼 */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                type="button"
                onClick={onLogout}
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                로그아웃
              </button>
              <button
                type="button"
                onClick={onExtend}
                autoFocus
                className="flex-[2] py-3 px-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-purple-500/25"
              >
                연장하기
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* 로그아웃 완료 모달 */}
      <Dialog.Root open={isLogoutCompleteOpen} onOpenChange={(open) => !open && onDismiss()}>
        <Dialog.Portal>
          <Dialog.Overlay
            className={cn(
              'fixed inset-0 bg-black/60 backdrop-blur-sm z-50',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
            )}
          />
          <Dialog.Content
            className={cn(
              'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2',
              'bg-white rounded-2xl shadow-2xl p-0 overflow-hidden',
              'data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
              'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
              'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
              'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
              'duration-200'
            )}
          >
            {/* 헤더 */}
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </div>
              </div>
              <Dialog.Title className="text-xl font-bold text-gray-900 text-center">
                자동 로그아웃
              </Dialog.Title>
              <Dialog.Description className="text-gray-500 text-center mt-2">
                연장 시도가 없어서 로그아웃 했습니다.
                <br />
                다시 로그인해주세요.
              </Dialog.Description>
            </div>

            {/* 버튼 */}
            <div className="px-6 pb-6">
              <Dialog.Close asChild>
                <button
                  type="button"
                  autoFocus
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/25"
                >
                  확인
                </button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
