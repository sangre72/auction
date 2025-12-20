'use client';

import { useState } from 'react';

interface UserProfile {
  name: string;
  nickname: string;
  email: string;
  phone: string;
  profileImage: string;
  provider: string;
  createdAt: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    name: '홍길동',
    nickname: '피규어덕후',
    email: 'user@example.com',
    phone: '010-****-5678',
    profileImage: '',
    provider: 'kakao',
    createdAt: '2024-01-01',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nickname: profile.nickname,
  });

  const handleSave = () => {
    setProfile({ ...profile, nickname: editForm.nickname });
    setIsEditing(false);
  };

  const getProviderName = (provider: string) => {
    const providers: Record<string, string> = {
      kakao: '카카오',
      naver: '네이버',
      google: '구글',
      apple: '애플',
    };
    return providers[provider] || provider;
  };

  const getProviderColor = (provider: string) => {
    const colors: Record<string, string> = {
      kakao: 'bg-yellow-400',
      naver: 'bg-green-500',
      google: 'bg-white border border-gray-300',
      apple: 'bg-black',
    };
    return colors[provider] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-xl font-bold text-gray-900">회원 정보 수정</h1>
        <p className="text-gray-500 text-sm mt-1">개인 정보를 확인하고 수정하세요</p>
      </div>

      {/* 프로필 카드 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-6">
          {/* 프로필 이미지 */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold">
              {profile.name.charAt(0)}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          {/* 기본 정보 */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center ${getProviderColor(profile.provider)}`}>
                {profile.provider === 'kakao' && (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3C6.477 3 2 6.463 2 10.691c0 2.717 1.804 5.103 4.515 6.452-.197.727-.714 2.634-.818 3.044-.128.506.186.499.39.363.161-.107 2.556-1.734 3.59-2.437.758.112 1.541.171 2.323.171 5.523 0 10-3.463 10-7.593C22 6.463 17.523 3 12 3z"/>
                  </svg>
                )}
              </span>
            </div>
            <p className="text-gray-500 mt-1">{profile.email}</p>
            <p className="text-sm text-gray-400 mt-2">
              {getProviderName(profile.provider)} 계정으로 가입 | 가입일: {profile.createdAt}
            </p>
          </div>
        </div>
      </div>

      {/* 정보 수정 폼 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">기본 정보</h3>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              >
                수정
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  저장
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {/* 이름 */}
          <div className="p-6 flex items-center">
            <span className="w-32 text-sm text-gray-500">이름</span>
            <span className="font-medium text-gray-900">{profile.name}</span>
            <span className="ml-2 text-xs text-gray-400">(변경 불가)</span>
          </div>

          {/* 닉네임 */}
          <div className="p-6 flex items-center">
            <span className="w-32 text-sm text-gray-500">닉네임</span>
            {isEditing ? (
              <input
                type="text"
                value={editForm.nickname}
                onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            ) : (
              <span className="font-medium text-gray-900">{profile.nickname}</span>
            )}
          </div>

          {/* 이메일 */}
          <div className="p-6 flex items-center">
            <span className="w-32 text-sm text-gray-500">이메일</span>
            <span className="font-medium text-gray-900">{profile.email}</span>
            <span className="ml-2 text-xs text-gray-400">(소셜 로그인 연동)</span>
          </div>

          {/* 전화번호 */}
          <div className="p-6 flex items-center">
            <span className="w-32 text-sm text-gray-500">전화번호</span>
            <span className="font-medium text-gray-900">{profile.phone}</span>
            <button className="ml-auto text-sm text-purple-600 hover:text-purple-700">
              변경
            </button>
          </div>
        </div>
      </div>

      {/* 계정 관리 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">계정 관리</h3>
        <div className="space-y-3">
          <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-between">
            <span className="text-gray-700">로그아웃</span>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
          <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-50 transition-colors flex items-center justify-between text-red-500">
            <span>회원 탈퇴</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
