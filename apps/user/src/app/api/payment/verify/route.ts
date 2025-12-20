import { NextRequest, NextResponse } from 'next/server';

const PORTONE_API_SECRET = process.env.PORTONE_API_SECRET || '';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

interface VerifyRequest {
  paymentId: string;
  productId?: number;
  slotNumbers?: number[];
  paymentMethod?: string;
}

/**
 * 결제 검증 API
 * 클라이언트에서 결제 완료 후 서버에서 검증
 */
export async function POST(request: NextRequest) {
  try {
    const body: VerifyRequest = await request.json();
    const { paymentId, productId, slotNumbers, paymentMethod } = body;

    if (!paymentId) {
      return NextResponse.json(
        { success: false, message: 'paymentId is required' },
        { status: 400 }
      );
    }

    // 포트원 API로 결제 조회 (V2)
    const response = await fetch(
      `https://api.portone.io/payments/${encodeURIComponent(paymentId)}`,
      {
        headers: {
          Authorization: `PortOne ${PORTONE_API_SECRET}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('PortOne API error:', error);
      return NextResponse.json(
        { success: false, message: '결제 정보를 확인할 수 없습니다.' },
        { status: 400 }
      );
    }

    const payment = await response.json();
    const paidAmount = payment.amount?.total;

    // 결제 상태 확인
    if (payment.status === 'PAID') {
      // 백엔드에 결제 완료 처리 요청
      if (productId && slotNumbers && slotNumbers.length > 0) {
        try {
          // 보안: 실제 결제된 금액(paidAmount)을 백엔드에 전달
          // 백엔드에서 슬롯가격 * 슬롯수와 비교하여 검증

          // 클라이언트의 쿠키를 백엔드로 전달
          const cookies = request.headers.get('cookie') || '';

          const backendResponse = await fetch(`${BACKEND_URL}/api/public/payments/complete`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cookie': cookies, // 쿠키 전달
            },
            body: JSON.stringify({
              order_id: paymentId,
              payment_id: payment.id,
              product_id: productId,
              slot_numbers: slotNumbers,
              paid_amount: paidAmount,  // PortOne에서 확인된 실제 결제 금액
              payment_method: paymentMethod || 'kakaopay',
            }),
          });

          if (!backendResponse.ok) {
            const backendError = await backendResponse.json();
            console.error('Backend API error:', backendError);
            return NextResponse.json(
              { success: false, message: backendError.detail || '결제 처리 중 오류가 발생했습니다.' },
              { status: 400 }
            );
          }

          const backendResult = await backendResponse.json();
          console.log('Backend save result:', backendResult);
        } catch (backendError) {
          console.error('Backend API call failed:', backendError);
          return NextResponse.json(
            { success: false, message: '결제 처리 서버 연결에 실패했습니다.' },
            { status: 500 }
          );
        }
      }

      return NextResponse.json({
        success: true,
        payment: {
          paymentId: payment.id,
          amount: paidAmount,
          status: payment.status,
          method: payment.method?.type,
          paidAt: payment.paidAt,
        },
      });
    }

    return NextResponse.json(
      { success: false, message: '결제가 완료되지 않았습니다.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, message: '결제 검증 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
