'use client';

import { useState } from 'react';
import { formatNumber } from '@auction/shared';

type PointType = 'all' | 'earned' | 'used' | 'expired';

interface PointHistory {
  id: string;
  type: 'earned' | 'used' | 'expired';
  amount: number;
  description: string;
  date: string;
  expiryDate?: string;
}

const typeTabs: { key: PointType; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'earned', label: '적립' },
  { key: 'used', label: '사용' },
  { key: 'expired', label: '소멸' },
];

// 임시 데이터
const pointHistory: PointHistory[] = [
  {
    id: '1',
    type: 'earned',
    amount: 5000,
    description: '신규 가입 축하 포인트',
    date: '2024-01-01',
    expiryDate: '2024-07-01',
  },
  {
    id: '2',
    type: 'earned',
    amount: 1250,
    description: '상품 구매 적립 (원피스 루피 피규어)',
    date: '2024-01-15',
    expiryDate: '2025-01-15',
  },
  {
    id: '3',
    type: 'used',
    amount: 3000,
    description: '상품 결제 시 사용',
    date: '2024-01-14',
  },
  {
    id: '4',
    type: 'expired',
    amount: 500,
    description: '유효기간 만료',
    date: '2024-01-10',
  },
];

export default function PointsPage() {
  const [activeTab, setActiveTab] = useState<PointType>('all');

  const filteredHistory = activeTab === 'all'
    ? pointHistory
    : pointHistory.filter(h => h.type === activeTab);

  const currentPoints = 5000;
  const expiringPoints = 2000;
  const expiringDate = '2024-02-28';

  return (
    <div className="space-y-6">
      {/* 포인트 요약 */}
      <div className="bg-gradient-to-br from-purple-600 to-cyan-500 rounded-2xl shadow-lg p-6 text-white">
        <p className="text-purple-100">보유 포인트</p>
        <p className="text-4xl font-bold mt-1">{formatNumber(currentPoints)}P</p>

        <div className="mt-6 p-4 bg-white/10 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-sm">소멸 예정 포인트</span>
            </div>
            <span className="font-bold">{formatNumber(expiringPoints)}P</span>
          </div>
          <p className="text-xs text-purple-200 mt-2">
            {expiringDate}까지 사용하지 않으면 소멸됩니다
          </p>
        </div>
      </div>

      {/* 포인트 안내 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">포인트 안내</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-purple-50 rounded-xl">
            <p className="text-2xl font-bold text-purple-600">1%</p>
            <p className="text-sm text-gray-500 mt-1">기본 적립률</p>
          </div>
          <div className="text-center p-4 bg-cyan-50 rounded-xl">
            <p className="text-2xl font-bold text-cyan-600">1년</p>
            <p className="text-sm text-gray-500 mt-1">유효기간</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <p className="text-2xl font-bold text-green-600">1,000P</p>
            <p className="text-sm text-gray-500 mt-1">최소 사용</p>
          </div>
        </div>
      </div>

      {/* 포인트 내역 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {typeTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="divide-y divide-gray-100">
          {filteredHistory.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-500">포인트 내역이 없습니다</p>
            </div>
          ) : (
            filteredHistory.map((history) => (
              <div key={history.id} className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    history.type === 'earned'
                      ? 'bg-green-100'
                      : history.type === 'used'
                      ? 'bg-blue-100'
                      : 'bg-gray-100'
                  }`}>
                    {history.type === 'earned' ? (
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    ) : history.type === 'used' ? (
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{history.description}</p>
                    <p className="text-sm text-gray-500">{history.date}</p>
                    {history.expiryDate && (
                      <p className="text-xs text-gray-400">유효기간: {history.expiryDate}</p>
                    )}
                  </div>
                </div>
                <span className={`text-lg font-bold ${
                  history.type === 'earned'
                    ? 'text-green-600'
                    : history.type === 'used'
                    ? 'text-blue-600'
                    : 'text-gray-400'
                }`}>
                  {history.type === 'earned' ? '+' : '-'}{formatNumber(history.amount)}P
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
