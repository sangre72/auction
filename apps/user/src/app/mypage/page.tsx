'use client';

import Link from 'next/link';
import { formatPrice } from '@auction/shared';

// 임시 데이터
const summaryData = {
  bidding: 2,      // 입찰 중
  won: 1,          // 낙찰
  shipping: 1,     // 배송 중
  completed: 5,    // 구매 완료
};

const recentOrders = [
  {
    id: '1',
    productName: '원피스 루피 기어5 피규어',
    image: '/images/sample-figure.jpg',
    status: 'shipping',
    statusText: '배송 중',
    date: '2024-01-15',
    price: 125000,
  },
  {
    id: '2',
    productName: '드래곤볼 손오공 울트라 인스팅트',
    image: '/images/sample-figure.jpg',
    status: 'preparing',
    statusText: '배송 준비 중',
    date: '2024-01-14',
    price: 89000,
  },
];

const recentBids = [
  {
    id: '1',
    productName: '귀멸의 칼날 탄지로 1/6 스케일',
    image: '/images/sample-figure.jpg',
    currentBid: 150000,
    myBid: 145000,
    isWinning: false,
    endTime: '2024-01-20 18:00',
  },
  {
    id: '2',
    productName: '진격의 거인 리바이 피규어',
    image: '/images/sample-figure.jpg',
    currentBid: 200000,
    myBid: 200000,
    isWinning: true,
    endTime: '2024-01-21 20:00',
  },
];

export default function MyPage() {
  return (
    <div className="space-y-6">
      {/* 주문 상태 요약 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">주문/배송 현황</h2>
        <div className="grid grid-cols-4 gap-4">
          <Link href="/mypage/bids" className="text-center p-4 rounded-xl hover:bg-gray-50 transition-colors">
            <p className="text-3xl font-bold text-purple-600">{summaryData.bidding}</p>
            <p className="text-sm text-gray-500 mt-1">입찰 중</p>
          </Link>
          <Link href="/mypage/won" className="text-center p-4 rounded-xl hover:bg-gray-50 transition-colors">
            <p className="text-3xl font-bold text-cyan-600">{summaryData.won}</p>
            <p className="text-sm text-gray-500 mt-1">낙찰</p>
          </Link>
          <Link href="/mypage/orders?status=shipping" className="text-center p-4 rounded-xl hover:bg-gray-50 transition-colors">
            <p className="text-3xl font-bold text-orange-500">{summaryData.shipping}</p>
            <p className="text-sm text-gray-500 mt-1">배송 중</p>
          </Link>
          <Link href="/mypage/orders?status=completed" className="text-center p-4 rounded-xl hover:bg-gray-50 transition-colors">
            <p className="text-3xl font-bold text-green-600">{summaryData.completed}</p>
            <p className="text-sm text-gray-500 mt-1">구매 완료</p>
          </Link>
        </div>
        {/* 진행 바 */}
        <div className="mt-6 flex items-center">
          <div className="flex-1 flex items-center">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-2">
              <div className="h-full bg-purple-500 w-full" />
            </div>
          </div>
          <div className="flex-1 flex items-center">
            <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-2">
              <div className="h-full bg-cyan-500 w-full" />
            </div>
          </div>
          <div className="flex-1 flex items-center">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </div>
            <div className="flex-1 h-1 bg-gray-200 mx-2">
              <div className="h-full bg-orange-500 w-1/2" />
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <div className="mt-2 flex text-xs text-gray-400">
          <span className="flex-1 text-center">입찰</span>
          <span className="flex-1 text-center">낙찰</span>
          <span className="flex-1 text-center">배송</span>
          <span className="w-8 text-center">완료</span>
        </div>
      </div>

      {/* 최근 주문 & 입찰 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 주문 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">최근 주문</h2>
            <Link href="/mypage/orders" className="text-sm text-purple-600 hover:text-purple-700">
              전체보기
            </Link>
          </div>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                  <div className="w-full h-full bg-gradient-to-br from-purple-100 to-cyan-100 flex items-center justify-center text-2xl">
                    🎭
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{order.productName}</p>
                  <p className="text-sm text-gray-500">{order.date}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === 'shipping'
                      ? 'bg-orange-100 text-orange-700'
                      : order.status === 'preparing'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {order.statusText}
                  </span>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {formatPrice(order.price)}원
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 진행 중인 입찰 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">진행 중인 입찰</h2>
            <Link href="/mypage/bids" className="text-sm text-purple-600 hover:text-purple-700">
              전체보기
            </Link>
          </div>
          <div className="space-y-4">
            {recentBids.map((bid) => (
              <div key={bid.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0 relative">
                  <div className="w-full h-full bg-gradient-to-br from-purple-100 to-cyan-100 flex items-center justify-center text-2xl">
                    🎭
                  </div>
                  {bid.isWinning && (
                    <div className="absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{bid.productName}</p>
                  <p className="text-xs text-gray-500">마감: {bid.endTime}</p>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-medium ${bid.isWinning ? 'text-green-600' : 'text-red-500'}`}>
                    {bid.isWinning ? '최고 입찰자' : '추월됨'}
                  </p>
                  <p className="text-sm text-gray-500">내 입찰: {formatPrice(bid.myBid)}원</p>
                  <p className="text-sm font-bold text-purple-600">
                    현재가: {formatPrice(bid.currentBid)}원
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 빠른 메뉴 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">자주 찾는 메뉴</h2>
        <div className="grid grid-cols-4 gap-4">
          <Link href="/mypage/points" className="flex flex-col items-center p-4 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm text-gray-700">포인트</span>
          </Link>
          <Link href="/mypage/coupons" className="flex flex-col items-center p-4 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <span className="text-sm text-gray-700">쿠폰</span>
          </Link>
          <Link href="/mypage/wishlist" className="flex flex-col items-center p-4 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-sm text-gray-700">관심상품</span>
          </Link>
          <Link href="/mypage/addresses" className="flex flex-col items-center p-4 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-sm text-gray-700">배송지</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
