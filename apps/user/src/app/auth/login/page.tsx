'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

type Provider = 'kakao' | 'naver' | 'google' | 'apple' | 'facebook' | 'twitter' | 'line' | 'github';

interface ProviderInfo {
  id: Provider;
  name: string;
  nameEn: string;
  bgColor: string;
  textColor: string;
  hoverColor: string;
  icon: React.ReactNode;
  region: 'kr' | 'global' | 'jp';
}

const providers: ProviderInfo[] = [
  // 한국
  {
    id: 'kakao',
    name: '카카오',
    nameEn: 'Kakao',
    bgColor: 'bg-[#FEE500]',
    textColor: 'text-[#000000]',
    hoverColor: 'hover:bg-[#FDD800]',
    region: 'kr',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.717 1.804 5.103 4.515 6.452-.197.727-.714 2.634-.818 3.044-.128.506.186.499.39.363.161-.107 2.556-1.734 3.59-2.437.758.112 1.541.171 2.323.171 5.523 0 10-3.463 10-7.593C22 6.463 17.523 3 12 3z"/>
      </svg>
    ),
  },
  {
    id: 'naver',
    name: '네이버',
    nameEn: 'Naver',
    bgColor: 'bg-[#03C75A]',
    textColor: 'text-white',
    hoverColor: 'hover:bg-[#02b350]',
    region: 'kr',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z"/>
      </svg>
    ),
  },
  // 글로벌 (한국에서도 많이 사용)
  {
    id: 'google',
    name: '구글',
    nameEn: 'Google',
    bgColor: 'bg-white',
    textColor: 'text-gray-700',
    hoverColor: 'hover:bg-gray-50',
    region: 'kr',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
  },
  {
    id: 'apple',
    name: '애플',
    nameEn: 'Apple',
    bgColor: 'bg-black',
    textColor: 'text-white',
    hoverColor: 'hover:bg-gray-900',
    region: 'global',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
      </svg>
    ),
  },
  {
    id: 'facebook',
    name: '페이스북',
    nameEn: 'Facebook',
    bgColor: 'bg-[#1877F2]',
    textColor: 'text-white',
    hoverColor: 'hover:bg-[#166FE5]',
    region: 'global',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    id: 'twitter',
    name: 'X',
    nameEn: 'X (Twitter)',
    bgColor: 'bg-black',
    textColor: 'text-white',
    hoverColor: 'hover:bg-gray-900',
    region: 'global',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    id: 'github',
    name: '깃허브',
    nameEn: 'GitHub',
    bgColor: 'bg-[#24292F]',
    textColor: 'text-white',
    hoverColor: 'hover:bg-[#1B1F23]',
    region: 'global',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
      </svg>
    ),
  },
  // 일본
  {
    id: 'line',
    name: '라인',
    nameEn: 'LINE',
    bgColor: 'bg-[#00B900]',
    textColor: 'text-white',
    hoverColor: 'hover:bg-[#00A800]',
    region: 'jp',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
      </svg>
    ),
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSocialLogin = (provider: Provider) => {
    window.location.href = `/api/auth/${provider}`;
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/user/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // httpOnly 쿠키 사용
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || '로그인에 실패했습니다.');
      }

      // 홈으로 이동 (전체 새로고침으로 Header 상태 갱신)
      window.location.href = '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 한국 서비스
  const krProviders = providers.filter(p => p.region === 'kr');
  // 글로벌 서비스
  const globalProviders = providers.filter(p => p.region === 'global');
  // 일본 서비스
  const jpProviders = providers.filter(p => p.region === 'jp');

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* 로고 & 타이틀 */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-3xl">🎭</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">피규어 경매</h1>
            <p className="text-gray-500 mt-2">간편하게 로그인하고 경매에 참여하세요</p>
          </div>

          {/* 이메일 로그인 폼 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
            <h2 className="text-sm font-medium text-gray-700 mb-4 text-center">이메일로 로그인</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                  placeholder="이메일"
                />
              </div>

              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                  placeholder="비밀번호"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '로그인 중...' : '로그인'}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-gray-500">
              계정이 없으신가요?{' '}
              <Link href="/register" className="text-purple-600 hover:text-purple-700 font-medium">
                회원가입
              </Link>
            </p>
          </div>

          {/* 구분선 */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-50 text-gray-500">또는 소셜 로그인</span>
            </div>
          </div>

          {/* 소셜 로그인 버튼들 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {/* 한국 서비스 */}
            <div className="space-y-3">
              <p className="text-xs text-gray-400 text-center mb-2 flex items-center justify-center gap-1">
                <span>🇰🇷</span> 한국 서비스
              </p>
              {krProviders.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => handleSocialLogin(provider.id)}
                  className={`w-full flex items-center justify-center gap-3 px-4 py-3.5 ${provider.bgColor} ${provider.textColor} rounded-xl font-medium ${provider.hoverColor} transition-colors`}
                >
                  {provider.icon}
                  {provider.name}로 시작하기
                </button>
              ))}
            </div>

            {/* 글로벌 서비스 */}
            <div className="mt-5 pt-4 border-t border-gray-100 space-y-3">
              <p className="text-xs text-gray-400 text-center mb-2 flex items-center justify-center gap-1">
                <span>🌍</span> 글로벌 서비스
              </p>
              {globalProviders.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => handleSocialLogin(provider.id)}
                  className={`w-full flex items-center justify-center gap-3 px-4 py-3 ${provider.bgColor} ${provider.textColor} rounded-xl font-medium ${provider.hoverColor} transition-colors ${provider.id === 'google' ? 'border border-gray-300' : ''}`}
                >
                  {provider.icon}
                  {provider.nameEn}
                </button>
              ))}
            </div>

            {/* 일본 서비스 (있을 경우에만 표시) */}
            {jpProviders.length > 0 && (
              <div className="mt-5 pt-4 border-t border-gray-100 space-y-3">
                <p className="text-xs text-gray-400 text-center mb-2 flex items-center justify-center gap-1">
                  <span>🇯🇵</span> 일본 서비스
                </p>
                {jpProviders.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => handleSocialLogin(provider.id)}
                    className={`w-full flex items-center justify-center gap-3 px-4 py-3 ${provider.bgColor} ${provider.textColor} rounded-xl font-medium ${provider.hoverColor} transition-colors`}
                  >
                    {provider.icon}
                    {provider.nameEn}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 안내 문구 */}
          <p className="text-center text-xs text-gray-400 mt-6">
            로그인 시 <span className="underline cursor-pointer hover:text-gray-600">이용약관</span> 및{' '}
            <span className="underline cursor-pointer hover:text-gray-600">개인정보처리방침</span>에 동의하게 됩니다.
          </p>

          {/* 혜택 안내 */}
          <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-cyan-50 rounded-xl border border-purple-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center shrink-0">
                <span className="text-white text-lg">🎁</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">신규 가입 혜택</p>
                <p className="text-sm text-gray-600 mt-0.5">
                  지금 가입하면 <span className="font-bold text-purple-600">5,000 포인트</span>를 드려요!
                </p>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
