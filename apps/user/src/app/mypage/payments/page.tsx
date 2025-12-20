'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type PaymentStatus = 'all' | 'completed' | 'cancelled' | 'refunded';

interface Payment {
  id: number;
  order_id: string;
  amount: number;
  paid_amount: number;
  method: string;
  status: string;
  description: string | null;
  paid_at: string | null;
  created_at: string;
}

const statusTabs: { key: PaymentStatus; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'completed', label: '결제완료' },
  { key: 'cancelled', label: '취소' },
  { key: 'refunded', label: '환불' },
];

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<PaymentStatus>('all');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      setIsLoading(true);
      try {
        const statusParam = activeTab !== 'all' ? `&status=${activeTab}` : '';
        const response = await fetch(
          `${BACKEND_URL}/api/users/me/payments?page=1&page_size=50${statusParam}`,
          {
            credentials: 'include', // httpOnly 쿠키 사용
          }
        );

        if (response.status === 401) {
          setIsAuthenticated(false);
          return;
        }

        if (!response.ok) {
          throw new Error('결제 내역을 불러오는데 실패했습니다.');
        }

        setIsAuthenticated(true);
        const data = await response.json();
        setPayments(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, [activeTab]);

  const formatPrice = (price: number) => price.toLocaleString('ko-KR');

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '결제 완료';
      case 'cancelled': return '취소';
      case 'refunded': return '환불 완료';
      case 'pending': return '결제 대기';
      case 'failed': return '결제 실패';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-gray-100 text-gray-700';
      case 'refunded': return 'bg-orange-100 text-orange-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'failed': return 'bg-red-100 text-red-700';
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

  const totalAmount = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.paid_amount, 0);

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
        <h1 className="text-xl font-bold text-gray-900">결제 내역</h1>
        <p className="text-gray-500 text-sm mt-1">결제 및 환불 내역을 확인하세요</p>

        {/* 요약 */}
        <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-cyan-50 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">총 결제 금액</p>
              <p className="text-2xl font-bold text-purple-600">{formatPrice(totalAmount)}원</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">결제 건수</p>
              <p className="text-2xl font-bold text-gray-900">
                {payments.filter(p => p.status === 'completed').length}건
              </p>
            </div>
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

        {/* 결제 목록 */}
        <div className="divide-y divide-gray-100">
          {isLoading ? (
            <div className="py-16 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent mx-auto"></div>
              <p className="text-gray-500 mt-4">로딩 중...</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center">
              <p className="text-red-500">{error}</p>
            </div>
          ) : payments.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <p className="text-gray-500">결제 내역이 없습니다</p>
            </div>
          ) : (
            payments.map((payment) => (
              <div key={payment.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* 아이콘 */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      payment.status === 'completed' ? 'bg-green-100' :
                      payment.status === 'refunded' ? 'bg-orange-100' : 'bg-gray-100'
                    }`}>
                      {payment.status === 'completed' ? (
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : payment.status === 'refunded' ? (
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>

                    {/* 정보 */}
                    <div>
                      <p className="font-medium text-gray-900">{payment.description || payment.order_id}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <span>{payment.paid_at ? formatDate(payment.paid_at) : formatDate(payment.created_at)}</span>
                        <span className="text-gray-300">|</span>
                        <span>{getMethodText(payment.method)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-1 ${getStatusColor(payment.status)}`}>
                      {getStatusText(payment.status)}
                    </span>
                    <p className={`text-lg font-bold ${payment.status === 'refunded' ? 'text-orange-600' : 'text-gray-900'}`}>
                      {payment.status === 'refunded' ? '-' : ''}{formatPrice(payment.paid_amount)}원
                    </p>
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
