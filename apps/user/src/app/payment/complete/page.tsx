'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface PendingPayment {
  orderId: string;
  orderName: string;
  productId: number;
  selectedSlots: number[];
  totalAmount: number;
  timestamp: number;
}

function PaymentCompleteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('');
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(null);

  useEffect(() => {
    // 로컬스토리지에서 결제 정보 가져오기
    const pendingPaymentStr = localStorage.getItem('pendingPayment');
    if (pendingPaymentStr) {
      try {
        const payment = JSON.parse(pendingPaymentStr) as PendingPayment;
        // 10분 이내의 결제 정보만 유효
        if (Date.now() - payment.timestamp < 10 * 60 * 1000) {
          setPendingPayment(payment);
        }
      } catch (e) {
        console.error('Failed to parse pending payment:', e);
      }
    }

    const paymentId = searchParams.get('paymentId');
    const code = searchParams.get('code');

    if (code) {
      // 결제 실패
      setStatus('failed');
      setMessage(searchParams.get('message') || '결제에 실패했습니다.');
      localStorage.removeItem('pendingPayment');
      return;
    }

    if (!paymentId) {
      setStatus('failed');
      setMessage('결제 정보를 찾을 수 없습니다.');
      return;
    }

    // 결제 검증 (pending payment 정보 포함)
    verifyPayment(paymentId, pendingPaymentStr ? JSON.parse(pendingPaymentStr) : null);
  }, [searchParams]);

  const verifyPayment = async (paymentId: string, pending: PendingPayment | null) => {
    try {
      const response = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          productId: pending?.productId,
          slotNumbers: pending?.selectedSlots,
          paymentMethod: 'kakaopay',
        }),
      });

      const data = await response.json();

      if (data.success) {
        // 결제 성공 - localStorage 정리
        localStorage.removeItem('pendingPayment');
        setStatus('success');
        setMessage('결제가 완료되었습니다!');
      } else {
        setStatus('failed');
        setMessage(data.message || '결제 검증에 실패했습니다.');
      }
    } catch (error) {
      setStatus('failed');
      setMessage('결제 확인 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {status === 'loading' && (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">결제 확인 중</h1>
              <p className="text-gray-500">잠시만 기다려주세요...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 완료!</h1>
              <p className="text-gray-500 mb-8">{message}</p>

              <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
                <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">슬롯 구매 성공</span>
                </div>
                <p className="text-sm text-gray-500">
                  마이페이지에서 구매 내역을 확인하실 수 있습니다.
                </p>
              </div>

              <div className="flex gap-3">
                <Link
                  href="/mypage/orders"
                  className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors text-center"
                >
                  주문 내역
                </Link>
                <Link
                  href="/"
                  className="flex-1 py-3 px-6 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors text-center"
                >
                  홈으로
                </Link>
              </div>
            </div>
          )}

          {status === 'failed' && (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">결제 실패</h1>
              <p className="text-gray-500 mb-8">{message}</p>

              <div className="flex gap-3">
                <button
                  onClick={() => router.back()}
                  className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  다시 시도
                </button>
                <Link
                  href="/"
                  className="flex-1 py-3 px-6 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors text-center"
                >
                  홈으로
                </Link>
              </div>
            </div>
          )}
        </div>
    </div>
  );
}

export default function PaymentCompletePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    }>
      <PaymentCompleteContent />
    </Suspense>
  );
}
