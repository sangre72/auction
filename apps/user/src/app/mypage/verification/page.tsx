'use client';

import { useState } from 'react';

type VerificationLevel = 'none' | 'phone' | 'ci';

interface VerificationStatus {
  level: VerificationLevel;
  phoneVerified: boolean;
  phoneVerifiedAt?: string;
  ciVerified: boolean;
  ciVerifiedAt?: string;
  ciProvider?: string;
}

export default function VerificationPage() {
  const [status] = useState<VerificationStatus>({
    level: 'phone',
    phoneVerified: true,
    phoneVerifiedAt: '2024-01-01',
    ciVerified: false,
  });

  const [isVerifying, setIsVerifying] = useState(false);

  const handleCIVerification = () => {
    setIsVerifying(true);
    // 본인인증 팝업 열기 (실제로는 PASS, 카카오 인증 등 연동)
    setTimeout(() => {
      setIsVerifying(false);
      alert('본인인증이 완료되었습니다.');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-xl font-bold text-gray-900">본인인증</h1>
        <p className="text-gray-500 text-sm mt-1">안전한 거래를 위해 본인인증을 완료해주세요</p>
      </div>

      {/* 인증 레벨 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">인증 현황</h2>

        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-cyan-50 rounded-xl mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              status.level === 'ci' ? 'bg-green-500' :
              status.level === 'phone' ? 'bg-yellow-500' : 'bg-gray-300'
            }`}>
              {status.level === 'ci' ? (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              ) : status.level === 'phone' ? (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <div>
              <p className="font-bold text-gray-900">
                {status.level === 'ci' ? '본인인증 완료' :
                 status.level === 'phone' ? '전화번호 인증' : '미인증'}
              </p>
              <p className="text-sm text-gray-500">
                {status.level === 'ci' ? '모든 서비스를 이용할 수 있습니다' :
                 status.level === 'phone' ? '기본 서비스를 이용할 수 있습니다' : '인증이 필요합니다'}
              </p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            status.level === 'ci' ? 'bg-green-100 text-green-700' :
            status.level === 'phone' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
          }`}>
            Lv.{status.level === 'ci' ? '3' : status.level === 'phone' ? '2' : '1'}
          </div>
        </div>

        {/* 인증 단계 */}
        <div className="space-y-4">
          {/* 1. 소셜 로그인 */}
          <div className="p-4 border border-green-200 bg-green-50 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">소셜 로그인</p>
                  <p className="text-sm text-gray-500">카카오 계정으로 가입됨</p>
                </div>
              </div>
              <span className="text-green-600 font-medium">완료</span>
            </div>
          </div>

          {/* 2. 전화번호 인증 */}
          <div className={`p-4 border rounded-xl ${
            status.phoneVerified ? 'border-green-200 bg-green-50' : 'border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  status.phoneVerified ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  {status.phoneVerified ? (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-white font-bold">2</span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">전화번호 인증</p>
                  <p className="text-sm text-gray-500">
                    {status.phoneVerified
                      ? `인증 완료 (${status.phoneVerifiedAt})`
                      : 'SMS 인증으로 전화번호를 확인합니다'}
                  </p>
                </div>
              </div>
              {status.phoneVerified ? (
                <span className="text-green-600 font-medium">완료</span>
              ) : (
                <button className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors">
                  인증하기
                </button>
              )}
            </div>
          </div>

          {/* 3. 본인인증 (CI) */}
          <div className={`p-4 border rounded-xl ${
            status.ciVerified ? 'border-green-200 bg-green-50' : 'border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  status.ciVerified ? 'bg-green-500' : 'bg-gray-300'
                }`}>
                  {status.ciVerified ? (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-white font-bold">3</span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">본인인증 (CI)</p>
                  <p className="text-sm text-gray-500">
                    {status.ciVerified
                      ? `${status.ciProvider}로 인증 완료 (${status.ciVerifiedAt})`
                      : 'PASS, 카카오 등을 통한 실명 인증'}
                  </p>
                </div>
              </div>
              {status.ciVerified ? (
                <span className="text-green-600 font-medium">완료</span>
              ) : (
                <button
                  onClick={handleCIVerification}
                  disabled={isVerifying}
                  className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {isVerifying ? '인증 중...' : '인증하기'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 인증 혜택 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">인증 레벨별 혜택</h2>

        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold text-sm">
              1
            </div>
            <div>
              <p className="font-medium text-gray-900">기본 (소셜 로그인)</p>
              <ul className="mt-2 text-sm text-gray-600 space-y-1">
                <li>- 경매 상품 조회</li>
                <li>- 관심 상품 등록</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-yellow-50 rounded-xl">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              2
            </div>
            <div>
              <p className="font-medium text-gray-900">전화번호 인증</p>
              <ul className="mt-2 text-sm text-gray-600 space-y-1">
                <li>- 경매 입찰 참여</li>
                <li>- 알림 수신</li>
                <li className="text-yellow-600">- 입찰 한도: 50만원</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
              3
            </div>
            <div>
              <p className="font-medium text-gray-900">본인인증 완료</p>
              <ul className="mt-2 text-sm text-gray-600 space-y-1">
                <li>- 모든 경매 참여</li>
                <li>- 고액 상품 입찰</li>
                <li className="text-green-600">- 입찰 한도: 무제한</li>
                <li className="text-green-600">- 우선 고객 지원</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
