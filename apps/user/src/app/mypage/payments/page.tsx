'use client';

import { useState } from 'react';

type PaymentStatus = 'all' | 'completed' | 'cancelled' | 'refunded';

interface Payment {
  id: string;
  orderId: string;
  productName: string;
  amount: number;
  paymentMethod: string;
  status: PaymentStatus;
  statusText: string;
  paidAt: string;
  cardInfo?: string;
}

const statusTabs: { key: PaymentStatus; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'completed', label: '결제완료' },
  { key: 'cancelled', label: '취소' },
  { key: 'refunded', label: '환불' },
];

// 임시 데이터
const payments: Payment[] = [
  {
    id: '1',
    orderId: 'ORD-2024011501',
    productName: '원피스 루피 기어5 피규어 1/6 스케일',
    amount: 125000,
    paymentMethod: 'card',
    status: 'completed',
    statusText: '결제 완료',
    paidAt: '2024-01-15 14:30',
    cardInfo: '신한카드 ****1234',
  },
  {
    id: '2',
    orderId: 'ORD-2024011401',
    productName: '드래곤볼 손오공 울트라 인스팅트 피규어',
    amount: 89000,
    paymentMethod: 'card',
    status: 'completed',
    statusText: '결제 완료',
    paidAt: '2024-01-14 10:15',
    cardInfo: '카카오페이',
  },
  {
    id: '3',
    orderId: 'ORD-2024010801',
    productName: '블리치 이치고 피규어',
    amount: 78000,
    paymentMethod: 'card',
    status: 'refunded',
    statusText: '환불 완료',
    paidAt: '2024-01-08 16:45',
    cardInfo: '토스페이',
  },
];

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<PaymentStatus>('all');

  const filteredPayments = activeTab === 'all'
    ? payments
    : payments.filter(payment => payment.status === activeTab);

  const formatPrice = (price: number) => price.toLocaleString('ko-KR');

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-gray-100 text-gray-700';
      case 'refunded': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const totalAmount = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

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
              <p className="text-sm text-gray-500">이번 달 결제 금액</p>
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
          {filteredPayments.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <p className="text-gray-500">결제 내역이 없습니다</p>
            </div>
          ) : (
            filteredPayments.map((payment) => (
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
                      <p className="font-medium text-gray-900">{payment.productName}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <span>{payment.paidAt}</span>
                        <span className="text-gray-300">|</span>
                        <span>{payment.cardInfo}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-1 ${getStatusColor(payment.status)}`}>
                      {payment.statusText}
                    </span>
                    <p className={`text-lg font-bold ${payment.status === 'refunded' ? 'text-orange-600' : 'text-gray-900'}`}>
                      {payment.status === 'refunded' ? '-' : ''}{formatPrice(payment.amount)}원
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
