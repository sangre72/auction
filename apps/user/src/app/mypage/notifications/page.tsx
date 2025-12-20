'use client';

import { useState } from 'react';

interface NotificationSetting {
  id: string;
  category: string;
  title: string;
  description: string;
  email: boolean;
  push: boolean;
  sms: boolean;
}

const initialSettings: NotificationSetting[] = [
  {
    id: 'bid',
    category: '입찰',
    title: '입찰 알림',
    description: '내 입찰이 추월되거나 경매가 곧 마감될 때',
    email: true,
    push: true,
    sms: true,
  },
  {
    id: 'won',
    category: '낙찰',
    title: '낙찰 알림',
    description: '경매에서 낙찰되었을 때',
    email: true,
    push: true,
    sms: true,
  },
  {
    id: 'payment',
    category: '결제',
    title: '결제 알림',
    description: '결제 완료, 환불 등 결제 관련 알림',
    email: true,
    push: true,
    sms: false,
  },
  {
    id: 'shipping',
    category: '배송',
    title: '배송 알림',
    description: '배송 출발, 도착 예정 등 배송 상태 변경 시',
    email: true,
    push: true,
    sms: false,
  },
  {
    id: 'wishlist',
    category: '관심상품',
    title: '관심 상품 알림',
    description: '관심 등록한 상품의 경매 시작, 가격 변동 시',
    email: false,
    push: true,
    sms: false,
  },
  {
    id: 'marketing',
    category: '마케팅',
    title: '이벤트/혜택 알림',
    description: '할인 이벤트, 쿠폰 발급 등 프로모션 정보',
    email: false,
    push: false,
    sms: false,
  },
];

export default function NotificationsPage() {
  const [settings, setSettings] = useState<NotificationSetting[]>(initialSettings);

  const handleToggle = (id: string, type: 'email' | 'push' | 'sms') => {
    setSettings(settings.map(setting =>
      setting.id === id
        ? { ...setting, [type]: !setting[type] }
        : setting
    ));
  };

  const handleAllToggle = (type: 'email' | 'push' | 'sms', value: boolean) => {
    setSettings(settings.map(setting => ({
      ...setting,
      [type]: value,
    })));
  };

  const allEmail = settings.every(s => s.email);
  const allPush = settings.every(s => s.push);
  const allSms = settings.every(s => s.sms);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-xl font-bold text-gray-900">알림 설정</h1>
        <p className="text-gray-500 text-sm mt-1">알림 수신 방법을 설정하세요</p>
      </div>

      {/* 전체 토글 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">전체 설정</h2>
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => handleAllToggle('push', !allPush)}
            className={`p-4 rounded-xl border-2 transition-colors ${
              allPush ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className={`w-5 h-5 ${allPush ? 'text-purple-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className={`font-medium ${allPush ? 'text-purple-600' : 'text-gray-600'}`}>
                푸시 알림
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {allPush ? '전체 켜짐' : '일부 꺼짐'}
            </p>
          </button>

          <button
            onClick={() => handleAllToggle('email', !allEmail)}
            className={`p-4 rounded-xl border-2 transition-colors ${
              allEmail ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className={`w-5 h-5 ${allEmail ? 'text-purple-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className={`font-medium ${allEmail ? 'text-purple-600' : 'text-gray-600'}`}>
                이메일
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {allEmail ? '전체 켜짐' : '일부 꺼짐'}
            </p>
          </button>

          <button
            onClick={() => handleAllToggle('sms', !allSms)}
            className={`p-4 rounded-xl border-2 transition-colors ${
              allSms ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className={`w-5 h-5 ${allSms ? 'text-purple-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className={`font-medium ${allSms ? 'text-purple-600' : 'text-gray-600'}`}>
                SMS
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {allSms ? '전체 켜짐' : '일부 꺼짐'}
            </p>
          </button>
        </div>
      </div>

      {/* 개별 설정 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">세부 설정</h2>
        </div>

        <div className="divide-y divide-gray-100">
          {settings.map((setting) => (
            <div key={setting.id} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                      {setting.category}
                    </span>
                    <h3 className="font-medium text-gray-900">{setting.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{setting.description}</p>
                </div>

                <div className="flex items-center gap-4">
                  {/* 푸시 */}
                  <button
                    onClick={() => handleToggle(setting.id, 'push')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                      setting.push ? 'text-purple-600' : 'text-gray-300'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="text-xs">푸시</span>
                  </button>

                  {/* 이메일 */}
                  <button
                    onClick={() => handleToggle(setting.id, 'email')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                      setting.email ? 'text-purple-600' : 'text-gray-300'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs">이메일</span>
                  </button>

                  {/* SMS */}
                  <button
                    onClick={() => handleToggle(setting.id, 'sms')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                      setting.sms ? 'text-purple-600' : 'text-gray-300'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-xs">SMS</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 저장 버튼 */}
      <div className="flex justify-end">
        <button className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors">
          설정 저장
        </button>
      </div>
    </div>
  );
}
