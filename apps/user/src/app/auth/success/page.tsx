'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const userParam = searchParams.get('user');

  let user = null;
  try {
    user = userParam ? JSON.parse(decodeURIComponent(userParam)) : null;
  } catch (error) {
    console.error('Failed to parse user data:', error);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-3">
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">로그인 성공!</h1>
          <p className="text-gray-600">
            소셜 로그인이 성공적으로 완료되었습니다.
          </p>
        </div>

        {user && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-left">
            <h2 className="text-lg font-semibold mb-4">사용자 정보</h2>
            <div className="space-y-2">
              {user.profileImage && (
                <div className="flex justify-center mb-4">
                  <img
                    src={user.profileImage}
                    alt="Profile"
                    className="w-20 h-20 rounded-full"
                  />
                </div>
              )}
              <p>
                <span className="font-medium">이름:</span> {user.name || 'N/A'}
              </p>
              <p>
                <span className="font-medium">이메일:</span>{' '}
                {user.email || 'N/A'}
              </p>
              <p>
                <span className="font-medium">제공자:</span>{' '}
                <span className="capitalize">{user.provider}</span>
              </p>
              <p className="text-xs text-gray-500">
                <span className="font-medium">ID:</span> {user.id}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => (window.location.href = '/')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          홈으로 돌아가기
        </button>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
