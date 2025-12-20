'use client';

import { useState } from 'react';
import Link from 'next/link';

type BidStatus = 'all' | 'active' | 'winning' | 'outbid' | 'ended';

interface Bid {
  id: string;
  auctionId: string;
  productName: string;
  image: string;
  myBid: number;
  currentBid: number;
  startPrice: number;
  status: BidStatus;
  isWinning: boolean;
  endTime: string;
  bidCount: number;
}

const statusTabs: { key: BidStatus; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'active', label: '진행 중' },
  { key: 'winning', label: '최고 입찰' },
  { key: 'outbid', label: '추월됨' },
  { key: 'ended', label: '종료' },
];

// 임시 데이터
const bids: Bid[] = [
  {
    id: '1',
    auctionId: 'auction-1',
    productName: '귀멸의 칼날 탄지로 1/6 스케일 피규어',
    image: '',
    myBid: 145000,
    currentBid: 150000,
    startPrice: 100000,
    status: 'outbid',
    isWinning: false,
    endTime: '2024-01-20 18:00',
    bidCount: 12,
  },
  {
    id: '2',
    auctionId: 'auction-2',
    productName: '진격의 거인 리바이 피규어 한정판',
    image: '',
    myBid: 200000,
    currentBid: 200000,
    startPrice: 150000,
    status: 'winning',
    isWinning: true,
    endTime: '2024-01-21 20:00',
    bidCount: 8,
  },
  {
    id: '3',
    auctionId: 'auction-3',
    productName: '주술회전 고죠 사토루 피규어',
    image: '',
    myBid: 180000,
    currentBid: 180000,
    startPrice: 120000,
    status: 'winning',
    isWinning: true,
    endTime: '2024-01-22 15:00',
    bidCount: 15,
  },
];

export default function BidsPage() {
  const [activeTab, setActiveTab] = useState<BidStatus>('all');

  const filteredBids = activeTab === 'all'
    ? bids
    : activeTab === 'winning'
    ? bids.filter(bid => bid.isWinning && bid.status !== 'ended')
    : activeTab === 'outbid'
    ? bids.filter(bid => !bid.isWinning && bid.status !== 'ended')
    : activeTab === 'active'
    ? bids.filter(bid => bid.status !== 'ended')
    : bids.filter(bid => bid.status === activeTab);

  const formatPrice = (price: number) => price.toLocaleString('ko-KR');

  const getTimeRemaining = (endTime: string) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return '종료됨';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}일 ${hours}시간 남음`;
    if (hours > 0) return `${hours}시간 ${minutes}분 남음`;
    return `${minutes}분 남음`;
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-xl font-bold text-gray-900">입찰 내역</h1>
        <p className="text-gray-500 text-sm mt-1">참여 중인 경매와 입찰 현황을 확인하세요</p>

        {/* 요약 */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-purple-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{bids.filter(b => b.status !== 'ended').length}</p>
            <p className="text-sm text-gray-500">진행 중</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{bids.filter(b => b.isWinning).length}</p>
            <p className="text-sm text-gray-500">최고 입찰</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{bids.filter(b => !b.isWinning && b.status !== 'ended').length}</p>
            <p className="text-sm text-gray-500">추월됨</p>
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

        {/* 입찰 목록 */}
        <div className="divide-y divide-gray-100">
          {filteredBids.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <p className="text-gray-500">입찰 내역이 없습니다</p>
            </div>
          ) : (
            filteredBids.map((bid) => (
              <div key={bid.id} className="p-6">
                <div className="flex gap-4">
                  {/* 상품 이미지 */}
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-cyan-100 rounded-lg flex items-center justify-center text-4xl shrink-0 relative">
                    🎭
                    {bid.isWinning && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* 상품 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link
                          href={`/auctions/${bid.auctionId}`}
                          className="font-medium text-gray-900 hover:text-purple-600 transition-colors"
                        >
                          {bid.productName}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-sm font-medium ${bid.isWinning ? 'text-green-600' : 'text-red-500'}`}>
                            {bid.isWinning ? '최고 입찰자' : '추월됨'}
                          </span>
                          <span className="text-gray-300">|</span>
                          <span className="text-sm text-gray-500">{bid.bidCount}명 참여</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-orange-600 font-medium">
                          {getTimeRemaining(bid.endTime)}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          마감: {bid.endTime}
                        </p>
                      </div>
                    </div>

                    {/* 가격 정보 */}
                    <div className="mt-3 flex items-end gap-6">
                      <div>
                        <p className="text-xs text-gray-400">내 입찰가</p>
                        <p className="text-lg font-bold text-gray-900">{formatPrice(bid.myBid)}원</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">현재가</p>
                        <p className={`text-lg font-bold ${bid.isWinning ? 'text-green-600' : 'text-purple-600'}`}>
                          {formatPrice(bid.currentBid)}원
                        </p>
                      </div>
                      {!bid.isWinning && (
                        <div className="ml-auto">
                          <Link
                            href={`/auctions/${bid.auctionId}`}
                            className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            재입찰하기
                          </Link>
                        </div>
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
