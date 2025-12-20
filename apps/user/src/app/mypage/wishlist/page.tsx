'use client';

import { useState } from 'react';
import Link from 'next/link';

interface WishlistItem {
  id: string;
  auctionId: string;
  productName: string;
  image: string;
  currentPrice: number;
  startPrice: number;
  status: 'active' | 'ended' | 'upcoming';
  statusText: string;
  endTime: string;
  bidCount: number;
}

// 임시 데이터
const wishlistItems: WishlistItem[] = [
  {
    id: '1',
    auctionId: 'auction-20',
    productName: '원피스 상디 피규어 1/6 스케일 한정판',
    image: '',
    currentPrice: 180000,
    startPrice: 150000,
    status: 'active',
    statusText: '진행 중',
    endTime: '2024-01-22 20:00',
    bidCount: 8,
  },
  {
    id: '2',
    auctionId: 'auction-21',
    productName: '귀멸의 칼날 네즈코 피규어',
    image: '',
    currentPrice: 0,
    startPrice: 120000,
    status: 'upcoming',
    statusText: '예정',
    endTime: '2024-01-25 18:00',
    bidCount: 0,
  },
  {
    id: '3',
    auctionId: 'auction-22',
    productName: '나루토 이타치 피규어 특별판',
    image: '',
    currentPrice: 250000,
    startPrice: 200000,
    status: 'ended',
    statusText: '종료',
    endTime: '2024-01-10 15:00',
    bidCount: 15,
  },
];

export default function WishlistPage() {
  const [items, setItems] = useState(wishlistItems);

  const formatPrice = (price: number) => price.toLocaleString('ko-KR');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'upcoming': return 'bg-blue-100 text-blue-700';
      case 'ended': return 'bg-gray-100 text-gray-500';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleRemove = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const activeCount = items.filter(i => i.status === 'active').length;
  const upcomingCount = items.filter(i => i.status === 'upcoming').length;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-xl font-bold text-gray-900">관심 상품</h1>
        <p className="text-gray-500 text-sm mt-1">관심 등록한 경매 상품을 확인하세요</p>

        {/* 요약 */}
        <div className="flex gap-4 mt-4">
          <div className="flex-1 bg-purple-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{items.length}</p>
            <p className="text-sm text-gray-500">전체</p>
          </div>
          <div className="flex-1 bg-green-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            <p className="text-sm text-gray-500">진행 중</p>
          </div>
          <div className="flex-1 bg-blue-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{upcomingCount}</p>
            <p className="text-sm text-gray-500">예정</p>
          </div>
        </div>
      </div>

      {/* 목록 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {items.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <p className="text-gray-500">관심 상품이 없습니다</p>
            <Link
              href="/auctions"
              className="inline-block mt-4 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              경매 둘러보기
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item.id} className="p-6">
                <div className="flex gap-4">
                  {/* 상품 이미지 */}
                  <Link
                    href={`/auctions/${item.auctionId}`}
                    className="w-24 h-24 bg-gradient-to-br from-purple-100 to-cyan-100 rounded-lg flex items-center justify-center text-4xl shrink-0 hover:opacity-80 transition-opacity"
                  >
                    🎭
                  </Link>

                  {/* 상품 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link
                          href={`/auctions/${item.auctionId}`}
                          className="font-medium text-gray-900 hover:text-purple-600 transition-colors"
                        >
                          {item.productName}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.statusText}
                          </span>
                          {item.bidCount > 0 && (
                            <span className="text-sm text-gray-500">{item.bidCount}명 참여</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>

                    {/* 가격 & 액션 */}
                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        {item.status === 'upcoming' ? (
                          <>
                            <p className="text-xs text-gray-400">시작가</p>
                            <p className="text-lg font-bold text-gray-900">{formatPrice(item.startPrice)}원</p>
                          </>
                        ) : (
                          <>
                            <p className="text-xs text-gray-400">현재가</p>
                            <p className="text-lg font-bold text-purple-600">{formatPrice(item.currentPrice)}원</p>
                          </>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {item.status === 'ended' ? '종료: ' : '마감: '}
                          {item.endTime}
                        </p>
                      </div>

                      {item.status === 'active' && (
                        <Link
                          href={`/auctions/${item.auctionId}`}
                          className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          입찰하기
                        </Link>
                      )}
                      {item.status === 'upcoming' && (
                        <span className="px-4 py-2 bg-gray-100 text-gray-500 text-sm font-medium rounded-lg">
                          시작 전
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
