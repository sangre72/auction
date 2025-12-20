'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');
  const provider = searchParams.get('provider');
  const customMessage = searchParams.get('message');
  const oauthError = searchParams.get('error');

  const providerNames: Record<string, string> = {
    kakao: '카카오',
    naver: '네이버',
    google: '구글',
  };

  const providerName = provider ? providerNames[provider] || provider : '';

  const errorMessages: Record<string, { title: string; message: string; action: string }> = {
    user_denied: {
      title: '로그인 취소',
      message: `${providerName} 로그인이 취소되었습니다.`,
      action: '다시 로그인하시려면 아래 버튼을 클릭하세요.',
    },
    invalid_state: {
      title: '보안 검증 실패',
      message: 'CSRF 검증에 실패했습니다. 보안을 위해 처음부터 다시 시도해주세요.',
      action: '홈페이지로 돌아가서 다시 로그인해주세요.',
    },
    no_provider: {
      title: '제공자 누락',
      message: '소셜 로그인 제공자가 지정되지 않았습니다.',
      action: '관리자에게 문의하거나 다시 시도해주세요.',
    },
    invalid_provider: {
      title: '지원하지 않는 제공자',
      message: `${providerName}은(는) 지원하지 않는 소셜 로그인 제공자입니다.`,
      action: '카카오, 네이버, 또는 구글로 로그인해주세요.',
    },
    MISSING_CONFIG: {
      title: '설정 오류',
      message: `${providerName} 로그인 설정이 완료되지 않았습니다.`,
      action: '관리자에게 문의해주세요.',
    },
    NETWORK_ERROR: {
      title: '네트워크 오류',
      message: '네트워크 연결에 문제가 있습니다.',
      action: '인터넷 연결을 확인하고 다시 시도해주세요.',
    },
    TIMEOUT_ERROR: {
      title: '시간 초과',
      message: '요청 시간이 초과되었습니다.',
      action: '잠시 후 다시 시도해주세요.',
    },
    TOKEN_REQUEST_FAILED: {
      title: '인증 실패',
      message: `${providerName} 인증 토큰을 받는데 실패했습니다.`,
      action: '다시 시도하거나 관리자에게 문의해주세요.',
    },
    USER_INFO_FAILED: {
      title: '사용자 정보 오류',
      message: `${providerName}에서 사용자 정보를 가져오는데 실패했습니다.`,
      action: '다시 시도하거나 관리자에게 문의해주세요.',
    },
    oauth_error: {
      title: 'OAuth 오류',
      message: `${providerName} 로그인 중 오류가 발생했습니다.${oauthError ? ` (${oauthError})` : ''}`,
      action: '다시 시도해주세요.',
    },
    callback_failed: {
      title: '로그인 처리 실패',
      message: '로그인 처리 중 오류가 발생했습니다.',
      action: '다시 시도하거나 다른 로그인 방법을 사용해주세요.',
    },
  };

  const errorInfo = reason
    ? errorMessages[reason] || {
        title: '오류 발생',
        message: customMessage || '알 수 없는 오류가 발생했습니다.',
        action: '다시 시도해주세요.',
      }
    : {
        title: '오류 발생',
        message: customMessage || '알 수 없는 오류가 발생했습니다.',
        action: '다시 시도해주세요.',
      };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-lg w-full space-y-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-4">
            <svg
              className="w-16 h-16 text-red-600 dark:text-red-400"
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
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">
            {errorInfo.title}
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
            {errorInfo.message}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {errorInfo.action}
          </p>
        </div>

        {(reason || oauthError) && (
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
              {reason && <span>오류 코드: {reason}</span>}
              {oauthError && <span className="ml-3">OAuth 에러: {oauthError}</span>}
              {provider && <span className="ml-3">제공자: {providerName}</span>}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3 pt-4">
          <button
            onClick={() => (window.location.href = '/')}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200 font-medium shadow-sm"
          >
            홈으로 돌아가기
          </button>
          {reason === 'user_denied' || reason === 'NETWORK_ERROR' || reason === 'TIMEOUT_ERROR' ? (
            <button
              onClick={() => (window.location.href = '/')}
              className="w-full px-6 py-3 border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200 font-medium"
            >
              다시 로그인하기
            </button>
          ) : (
            <button
              onClick={() => window.history.back()}
              className="w-full px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              이전 페이지로
            </button>
          )}
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
