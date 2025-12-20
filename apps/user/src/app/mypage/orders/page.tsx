'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PurchaseSlot {
  slot_number: number;
  paid_price: number;
  purchased_at: string | null;
}

interface Purchase {
  payment_id: number;
  order_id: string;
  product_id: number;
  product_title: string;
  product_thumbnail: string | null;
  slots: PurchaseSlot[];
  total_amount: number;
  payment_method: string;
  payment_status: string;
  purchased_at: string | null;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export default function OrdersPage() {
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchPurchases = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/users/me/purchases?page=1&page_size=50`,
          {
            credentials: 'include', // httpOnly 쿠키 사용
          }
        );

        if (response.status === 401) {
          setIsAuthenticated(false);
          return;
        }

        if (!response.ok) {
          throw new Error('구매 내역을 불러오는데 실패했습니다.');
        }

        setIsAuthenticated(true);
        const data = await response.json();
        setPurchases(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPurchases();
  }, []);

  const formatPrice = (price: number) => price.toLocaleString('ko-KR');

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '구매 완료';
      case 'cancelled': return '취소됨';
      case 'refunded': return '환불됨';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-gray-100 text-gray-700';
      case 'refunded': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getMethodText = (method: string) => {
    switch (method) {
      case 'kakaopay': return '카카오페이';
      case 'tosspay': return '토스페이';
      case 'card': return '신용카드';
      default: return method;
    }
  };

  if (!isLoading && !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500 mb-4">로그인이 필요합니다.</p>
          <Link
            href="/auth/login"
            className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            로그인하기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-xl font-bold text-gray-900">구매 내역</h1>
        <p className="text-gray-500 text-sm mt-1">구매한 상품과 슬롯 정보를 확인하세요</p>
      </div>

      {/* 구매 목록 */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-16 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent mx-auto"></div>
            <p className="text-gray-500 mt-4">로딩 중...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-16 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : purchases.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-16 text-center">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-gray-500 mb-4">구매 내역이 없습니다</p>
            <Link
              href="/"
              className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              상품 둘러보기
            </Link>
          </div>
        ) : (
          purchases.map((purchase) => (
            <div key={purchase.payment_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* 헤더 */}
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900">
                    {purchase.purchased_at ? formatDate(purchase.purchased_at) : '-'}
                  </span>
                  <span className="text-sm text-gray-400">{purchase.order_id}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(purchase.payment_status)}`}>
                  {getStatusText(purchase.payment_status)}
                </span>
              </div>

              {/* 상품 정보 */}
              <div className="p-6">
                <div className="flex gap-4">
                  {/* 이미지 */}
                  <Link href={`/auctions/${purchase.product_id}`} className="shrink-0">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-cyan-100 rounded-xl flex items-center justify-center overflow-hidden">
                      {purchase.product_thumbnail ? (
                        <img
                          src={purchase.product_thumbnail}
                          alt={purchase.product_title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-4xl">🎭</span>
                      )}
                    </div>
                  </Link>

                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/auctions/${purchase.product_id}`}>
                      <h3 className="font-semibold text-gray-900 hover:text-purple-600 transition-colors line-clamp-2">
                        {purchase.product_title}
                      </h3>
                    </Link>

                    {/* 슬롯 정보 */}
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {purchase.slots.map((slot) => (
                        <span
                          key={slot.slot_number}
                          className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-lg"
                        >
                          {slot.slot_number}번 슬롯
                        </span>
                      ))}
                    </div>

                    {/* 결제 정보 */}
                    <div className="mt-3 flex items-center gap-3 text-sm text-gray-500">
                      <span>{getMethodText(purchase.payment_method)}</span>
                      <span className="text-gray-300">|</span>
                      <span>{purchase.slots.length}개 슬롯</span>
                    </div>
                  </div>

                  {/* 금액 */}
                  <div className="text-right shrink-0">
                    <p className="text-sm text-gray-500">결제 금액</p>
                    <p className="text-xl font-bold text-purple-600">
                      {formatPrice(purchase.total_amount)}원
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
