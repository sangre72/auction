'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  const errorMessages: Record<string, string> = {
    invalid_state: 'CSRF 검증에 실패했습니다. 다시 시도해주세요.',
    no_provider: '소셜 로그인 제공자가 지정되지 않았습니다.',
    invalid_provider: '지원하지 않는 소셜 로그인 제공자입니다.',
    callback_failed: '로그인 처리 중 오류가 발생했습니다.',
  };

  const errorMessage =
    errorMessages[reason || ''] || '알 수 없는 오류가 발생했습니다.';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 p-3">
            <svg
              className="w-12 h-12 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">로그인 실패</h1>
          <p className="text-gray-600">{errorMessage}</p>
          {reason && (
            <p className="text-sm text-gray-500 mt-2">오류 코드: {reason}</p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => (window.location.href = '/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            다시 시도하기
          </button>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            이전 페이지로
          </button>
        </div>
      </div>
    </main>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  );
}
