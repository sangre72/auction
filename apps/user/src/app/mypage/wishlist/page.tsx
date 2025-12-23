'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { formatPrice } from '@auction/shared';
import { useWishlist } from '@/hooks/useWishlist';
import type { WishlistItem } from '@/types';
import { useAuth } from '@/hooks/useAuth';

export default function WishlistPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { items, isLoading, error, meta, fetchWishlist, removeFromWishlist } = useWishlist();

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated, fetchWishlist]);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '진행 중';
      case 'pending': return '대기';
      case 'draft': return '준비';
      case 'sold': return '판매완료';
      case 'expired': return '종료';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-blue-100 text-blue-700';
      case 'sold': return 'bg-purple-100 text-purple-700';
      case 'expired': return 'bg-gray-100 text-gray-500';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleRemove = async (productId: number) => {
    await removeFromWishlist(productId);
  };

  const formatEndTime = (endTime: string | null) => {
    if (!endTime) return '-';
    const date = new Date(endTime);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const activeCount = items.filter(i => i.product_status === 'active').length;
  const pendingCount = items.filter(i => i.product_status === 'pending').length;

  // 로그인 체크 중
  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // 비로그인
  if (!isAuthenticated) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <p className="text-gray-500 mb-4">로그인이 필요합니다</p>
        <Link
          href="/login"
          className="inline-block px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
        >
          로그인하기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-xl font-bold text-gray-900">관심 상품</h1>
        <p className="text-gray-500 text-sm mt-1">관심 등록한 경매 상품을 확인하세요</p>

        {/* 요약 */}
        <div className="flex gap-4 mt-4">
          <div className="flex-1 bg-purple-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{meta.total_count}</p>
            <p className="text-sm text-gray-500">전체</p>
          </div>
          <div className="flex-1 bg-green-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            <p className="text-sm text-gray-500">진행 중</p>
          </div>
          <div className="flex-1 bg-blue-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{pendingCount}</p>
            <p className="text-sm text-gray-500">대기</p>
          </div>
        </div>
      </div>

      {/* 목록 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
          </div>
        ) : error ? (
          <div className="py-16 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : items.length === 0 ? (
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
            {items.map((item: WishlistItem) => (
              <div key={item.id} className="p-6">
                <div className="flex gap-4">
                  {/* 상품 이미지 */}
                  <Link
                    href={`/auctions/${item.product_id}`}
                    className="w-24 h-24 bg-gradient-to-br from-purple-100 to-cyan-100 rounded-lg flex items-center justify-center shrink-0 hover:opacity-80 transition-opacity overflow-hidden"
                  >
                    {item.product_thumbnail ? (
                      <img
                        src={item.product_thumbnail}
                        alt={item.product_title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl">🎁</span>
                    )}
                  </Link>

                  {/* 상품 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <Link
                          href={`/auctions/${item.product_id}`}
                          className="font-medium text-gray-900 hover:text-purple-600 transition-colors line-clamp-1"
                        >
                          {item.product_title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.product_status)}`}>
                            {getStatusText(item.product_status)}
                          </span>
                          {item.bid_count > 0 && (
                            <span className="text-sm text-gray-500">{item.bid_count}명 참여</span>
                          )}
                          <span className="text-sm text-gray-400">
                            {item.sold_slot_count}/{item.slot_count}슬롯
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemove(item.product_id)}
                        className="p-2 text-red-400 hover:text-red-600 transition-colors"
                        title="관심 상품에서 삭제"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>

                    {/* 가격 & 액션 */}
                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        {item.current_price ? (
                          <>
                            <p className="text-xs text-gray-400">현재가</p>
                            <p className="text-lg font-bold text-purple-600">{formatPrice(item.current_price)}원</p>
                          </>
                        ) : (
                          <>
                            <p className="text-xs text-gray-400">시작가</p>
                            <p className="text-lg font-bold text-gray-900">{formatPrice(item.starting_price)}원</p>
                          </>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          마감: {formatEndTime(item.end_time)}
                        </p>
                      </div>

                      {item.product_status === 'active' && (
                        <Link
                          href={`/auctions/${item.product_id}`}
                          className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          입찰하기
                        </Link>
                      )}
                      {item.product_status === 'pending' && (
                        <span className="px-4 py-2 bg-gray-100 text-gray-500 text-sm font-medium rounded-lg">
                          시작 전
                        </span>
                      )}
                      {item.product_status === 'sold' && (
                        <span className="px-4 py-2 bg-purple-100 text-purple-600 text-sm font-medium rounded-lg">
                          판매완료
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 페이지네이션 */}
        {meta.total_pages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-gray-100">
            <button
              onClick={() => fetchWishlist(meta.page - 1)}
              disabled={!meta.has_prev}
              className="px-3 py-1 text-sm rounded-lg bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
            >
              이전
            </button>
            <span className="px-3 py-1 text-sm text-gray-600">
              {meta.page} / {meta.total_pages}
            </span>
            <button
              onClick={() => fetchWishlist(meta.page + 1)}
              disabled={!meta.has_next}
              className="px-3 py-1 text-sm rounded-lg bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
