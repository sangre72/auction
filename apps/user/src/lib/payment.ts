/**
 * 포트원 결제 연동
 *
 * 테스트 계정 발급: https://admin.portone.io
 * 문서: https://developers.portone.io/docs/ko/v2-payment/v2
 */

import * as PortOne from '@portone/browser-sdk/v2';

// 환경변수에서 가져오기
const STORE_ID = process.env.NEXT_PUBLIC_PORTONE_STORE_ID || '';

// 결제 수단별 채널 키
export const PAYMENT_CHANNELS = {
  kakaopay: {
    key: 'channel-key-2348c5fe-a24c-4452-a532-a6e4d2860ffc',
    name: '카카오페이',
    icon: '💛',
    payMethod: 'EASY_PAY' as const,
  },
} as const;

export type PaymentMethod = keyof typeof PAYMENT_CHANNELS;

export interface PaymentRequest {
  orderId: string;
  orderName: string;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  transactionType?: string;
  txId?: string;
  code?: string;
  message?: string;
}

/**
 * 결제 요청
 */
export async function requestPayment(request: PaymentRequest): Promise<PaymentResult> {
  try {
    const channel = PAYMENT_CHANNELS[request.paymentMethod];
    console.log('[PortOne] 결제 요청 시작');
    console.log('[PortOne] STORE_ID:', STORE_ID);
    console.log('[PortOne] channelKey:', channel.key);

    // 리다이렉트 URL에 paymentId 포함
    const redirectUrl = `${window.location.origin}/payment/complete?paymentId=${encodeURIComponent(request.orderId)}`;
    console.log('[PortOne] redirectUrl:', redirectUrl);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paymentParams: any = {
      storeId: STORE_ID,
      channelKey: channel.key,
      paymentId: request.orderId,
      orderName: request.orderName,
      totalAmount: request.totalAmount,
      currency: 'CURRENCY_KRW',
      payMethod: channel.payMethod,
      customer: {
        email: request.customerEmail,
        fullName: request.customerName,
        phoneNumber: request.customerPhone,
      },
      redirectUrl,
    };
    console.log('[PortOne] paymentParams:', paymentParams);

    const response = await PortOne.requestPayment(paymentParams);
    console.log('[PortOne] response:', response);

    if (response?.code) {
      // 에러 발생
      console.log('[PortOne] 에러 코드:', response.code);
      return {
        success: false,
        code: response.code,
        message: response.message,
      };
    }

    // 응답이 있으면 결제 성공
    if (response?.paymentId || response?.txId) {
      console.log('[PortOne] 결제 성공!');
      return {
        success: true,
        paymentId: response?.paymentId || request.orderId,
        transactionType: response?.transactionType,
        txId: response?.txId,
      };
    }

    // 응답이 없는 경우 - 팝업이 닫혔지만 결과를 못 받음
    // 직접 결제 상태 확인 필요
    console.log('[PortOne] 응답 없음 - 결제 상태 확인 필요');
    return {
      success: false,
      code: 'NO_RESPONSE',
      message: '결제 창이 닫혔습니다. 결제 상태를 확인해 주세요.',
      paymentId: request.orderId,
    };
  } catch (error) {
    console.error('[PortOne] Payment error:', error);
    return {
      success: false,
      code: 'UNKNOWN_ERROR',
      message: error instanceof Error ? error.message : '결제 중 오류가 발생했습니다.',
    };
  }
}

/**
 * 주문 ID 생성
 */
export function generateOrderId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `ORDER_${timestamp}_${random}`;
}

/**
 * 결제 검증 (서버에서 호출)
 */
export async function verifyPayment(paymentId: string): Promise<boolean> {
  try {
    const response = await fetch('/api/payment/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId }),
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Payment verification error:', error);
    return false;
  }
}
