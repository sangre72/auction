'use client';

import { useState } from 'react';
import Link from 'next/link';

type WonStatus = 'all' | 'pending_payment' | 'paid' | 'shipped' | 'completed';

interface WonAuction {
  id: string;
  auctionId: string;
  productName: string;
  image: string;
  finalPrice: number;
  status: WonStatus;
  statusText: string;
  wonAt: string;
  paymentDeadline?: string;
}

const statusTabs: { key: WonStatus; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'pending_payment', label: '결제대기' },
  { key: 'paid', label: '결제완료' },
  { key: 'shipped', label: '배송중' },
  { key: 'completed', label: '완료' },
];

// 임시 데이터
const wonAuctions: WonAuction[] = [
  {
    id: '1',
    auctionId: 'auction-10',
    productName: '에반게리온 초호기 메탈빌드 피규어',
    image: '',
    finalPrice: 350000,
    status: 'pending_payment',
    statusText: '결제 대기',
    wonAt: '2024-01-15 20:00',
    paymentDeadline: '2024-01-17 20:00',
  },
  {
    id: '2',
    auctionId: 'auction-11',
    productName: '건담 RX-78-2 PG 1/60 스케일',
    image: '',
    finalPrice: 280000,
    status: 'paid',
    statusText: '결제 완료',
    wonAt: '2024-01-12 18:00',
  },
  {
    id: '3',
    auctionId: 'auction-12',
    productName: '스파이더맨 핫토이 1/6 피규어',
    image: '',
    finalPrice: 450000,
    status: 'completed',
    statusText: '거래 완료',
    wonAt: '2024-01-05 15:00',
  },
];

export default function WonPage() {
  const [activeTab, setActiveTab] = useState<WonStatus>('all');

  const filteredAuctions = activeTab === 'all'
    ? wonAuctions
    : wonAuctions.filter(auction => auction.status === activeTab);

  const formatPrice = (price: number) => price.toLocaleString('ko-KR');

  const getStatusColor = (status: WonStatus) => {
    switch (status) {
      case 'pending_payment': return 'bg-red-100 text-red-700';
      case 'paid': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-orange-100 text-orange-700';
      case 'completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTimeRemaining = (deadline: string) => {
    const end = new Date(deadline);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return '기한 만료';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}일 ${hours % 24}시간 남음`;
    }
    return `${hours}시간 ${minutes}분 남음`;
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-xl font-bold text-gray-900">낙찰 내역</h1>
        <p className="text-gray-500 text-sm mt-1">낙찰받은 상품과 결제 현황을 확인하세요</p>

        {/* 요약 */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-600">
              {wonAuctions.filter(a => a.status === 'pending_payment').length}
            </p>
            <p className="text-sm text-gray-500">결제 대기</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {wonAuctions.filter(a => a.status === 'paid').length}
            </p>
            <p className="text-sm text-gray-500">결제 완료</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">
              {wonAuctions.filter(a => a.status === 'shipped').length}
            </p>
            <p className="text-sm text-gray-500">배송 중</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {wonAuctions.filter(a => a.status === 'completed').length}
            </p>
            <p className="text-sm text-gray-500">거래 완료</p>
          </div>
        </div>
      </div>

      {/* 탭 & 목록 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {statusTabs.map((tab) => (
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

        {/* 낙찰 목록 */}
        <div className="divide-y divide-gray-100">
          {filteredAuctions.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-500">낙찰 내역이 없습니다</p>
            </div>
          ) : (
            filteredAuctions.map((auction) => (
              <div key={auction.id} className="p-6">
                <div className="flex gap-4">
                  {/* 상품 이미지 */}
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-cyan-100 rounded-lg flex items-center justify-center text-4xl shrink-0">
                    🎭
                  </div>

                  {/* 상품 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link
                          href={`/auctions/${auction.auctionId}`}
                          className="font-medium text-gray-900 hover:text-purple-600 transition-colors"
                        >
                          {auction.productName}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">
                          낙찰일: {auction.wonAt}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(auction.status)}`}>
                        {auction.statusText}
                      </span>
                    </div>

                    {/* 가격 & 액션 */}
                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        <p className="text-xs text-gray-400">낙찰가</p>
                        <p className="text-xl font-bold text-purple-600">{formatPrice(auction.finalPrice)}원</p>
                      </div>

                      {auction.status === 'pending_payment' && auction.paymentDeadline && (
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xs text-red-500 font-medium">결제 마감</p>
                            <p className="text-sm text-red-600">{getTimeRemaining(auction.paymentDeadline)}</p>
                          </div>
                          <button className="px-6 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors">
                            결제하기
                          </button>
                        </div>
                      )}

                      {auction.status === 'paid' && (
                        <span className="text-sm text-blue-600">배송 준비 중</span>
                      )}

                      {auction.status === 'completed' && (
                        <button className="px-4 py-2 text-sm font-medium text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
                          리뷰 작성
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
