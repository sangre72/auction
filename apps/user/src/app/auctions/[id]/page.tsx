'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { QueueOverlay } from '@/components/queue/QueueOverlay';
import { QueueListPanel } from '@/components/queue/QueueListPanel';
import { BidConfirmModal } from '@/components/auction/BidConfirmModal';
import { productsApi, slotsApi, Product, SlotListItem } from '@/lib/api';
import { useProductQueue } from '@/hooks/useProductQueue';
import { getUserId } from '@/lib/user';
import { formatPrice } from '@auction/shared';
import { requestPayment, generateOrderId, PaymentMethod } from '@/lib/payment';

export default function AuctionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const productId = parseInt(id, 10);

  const [product, setProduct] = useState<Product | null>(null);
  const [slots, setSlots] = useState<SlotListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // userId를 동기적으로 초기화 (SSR에서는 빈 문자열, 클라이언트에서는 즉시 값 설정)
  const [userId, setUserId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return getUserId();
    }
    return '';
  });
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [paymentMessage, setPaymentMessage] = useState('');
  const [completedPaymentId, setCompletedPaymentId] = useState<string | null>(null);

  // SSR에서 빈 문자열로 시작했다면 클라이언트에서 다시 설정
  useEffect(() => {
    if (!userId) {
      setUserId(getUserId());
    }
  }, [userId]);

  // 대기 중인 결제가 있으면 확인
  useEffect(() => {
    const checkPendingPayment = async () => {
      const pendingPaymentStr = localStorage.getItem('pendingPayment');
      if (!pendingPaymentStr) return;

      try {
        const pendingPayment = JSON.parse(pendingPaymentStr);
        // 10분 이내의 결제 정보만 확인
        if (Date.now() - pendingPayment.timestamp > 10 * 60 * 1000) {
          localStorage.removeItem('pendingPayment');
          return;
        }

        // 결제 검증 (상품/슬롯 정보 포함)
        const response = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentId: pendingPayment.orderId,
            productId: pendingPayment.productId,
            slotNumbers: pendingPayment.selectedSlots,
            totalAmount: pendingPayment.totalAmount,
            paymentMethod: 'kakaopay',
          }),
        });

        const data = await response.json();
        if (data.success) {
          // 결제 완료 - 완료 페이지로 이동
          localStorage.removeItem('pendingPayment');
          router.push(`/payment/complete?paymentId=${pendingPayment.orderId}`);
        } else {
          // 결제 미완료 - pendingPayment 유지 (사용자가 결제를 완료하지 않았을 수 있음)
          console.log('Payment not completed yet:', data.message);
        }
      } catch (error) {
        console.error('Failed to check pending payment:', error);
      }
    };

    checkPendingPayment();
  }, [router]);

  // 대기열 관리
  const queue = useProductQueue({
    productId: productId || 0,
    userId,
    autoConnect: !!userId && !isNaN(productId),
  });

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (isNaN(productId)) {
        setError('잘못된 상품 ID입니다.');
        return;
      }

      const [productResponse, slotsResponse] = await Promise.all([
        productsApi.getById(productId),
        slotsApi.getByProduct(productId),
      ]);

      setProduct(productResponse.data);
      setSlots(slotsResponse.data);
    } catch (err) {
      console.error('Failed to fetch product:', err);
      setError('상품을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 페이지 이탈 시 대기열에서 나가기
  useEffect(() => {
    const handleBeforeUnload = () => {
      queue.leave();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      queue.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLeaveQueue = () => {
    queue.disconnect();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || '상품을 찾을 수 없습니다'}
          </h1>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const getTimeRemaining = () => {
    if (!product.end_time) return '기한 없음';

    const now = new Date();
    const endTime = new Date(product.end_time);
    const diff = endTime.getTime() - now.getTime();

    if (diff <= 0) return '종료됨';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}일 ${hours}시간 ${minutes}분`;
    if (hours > 0) return `${hours}시간 ${minutes}분`;
    return `${minutes}분`;
  };

  // 슬롯 상태 확인
  const getSlotStatus = (slotNumber: number) => {
    const slot = slots.find((s) => s.slot_number === slotNumber);
    if (!slot) return 'available';
    return slot.status;
  };

  const availableSlots = slots.filter((s) => s.status === 'available').map((s) => s.slot_number);

  const toggleSlot = (slotNumber: number) => {
    const status = getSlotStatus(slotNumber);
    if (status !== 'available') return;

    setSelectedSlots((prev) =>
      prev.includes(slotNumber)
        ? prev.filter((s) => s !== slotNumber)
        : [...prev, slotNumber]
    );
  };

  const slotPrice = product.slot_price || product.current_price || product.starting_price;
  const totalBidAmount = selectedSlots.length * slotPrice;

  const handleBid = () => {
    if (selectedSlots.length === 0) return;
    setIsBidModalOpen(true);
  };

  const handleConfirmBid = async (paymentMethod: PaymentMethod) => {
    if (!product) return;

    setIsProcessing(true);
    setPaymentStatus('processing');
    console.log('=== 결제 시작 ===');
    console.log('paymentMethod:', paymentMethod);
    console.log('totalAmount:', totalBidAmount);

    try {
      const orderId = generateOrderId();
      const orderName = `${product.title} - ${selectedSlots.length}개 슬롯`;
      console.log('orderId:', orderId);

      // 결제 정보를 로컬스토리지에 저장 (리다이렉트 복귀 시 사용)
      localStorage.setItem('pendingPayment', JSON.stringify({
        orderId,
        orderName,
        productId: product.id,
        selectedSlots,
        totalAmount: totalBidAmount,
        timestamp: Date.now(),
      }));
      console.log('pendingPayment 저장 완료');

      console.log('requestPayment 호출...');
      const result = await requestPayment({
        orderId,
        orderName,
        totalAmount: totalBidAmount,
        paymentMethod,
      });
      console.log('requestPayment 결과:', result);

      // 리다이렉트 방식의 경우 여기까지 오지 않을 수 있음
      if (result.success) {
        // 결제 성공 - 백엔드에 저장
        console.log('결제 성공! 백엔드 저장 중...');
        try {
          const verifyResponse = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentId: orderId,
              productId: product.id,
              slotNumbers: selectedSlots,
              paymentMethod,
            }),
          });
          const verifyData = await verifyResponse.json();
          console.log('백엔드 저장 결과:', verifyData);

          if (verifyData.success) {
            localStorage.removeItem('pendingPayment');
            setCompletedPaymentId(orderId);
            setPaymentStatus('success');
            setPaymentMessage('결제가 성공적으로 완료되었습니다.');
          } else {
            setPaymentStatus('failed');
            setPaymentMessage(verifyData.message || '결제 처리 중 오류가 발생했습니다.');
          }
        } catch (err) {
          console.error('백엔드 저장 실패:', err);
          setPaymentStatus('failed');
          setPaymentMessage('결제 정보 저장 중 오류가 발생했습니다.');
        }
      } else if (result.code === 'USER_CANCEL') {
        // 사용자 취소
        console.log('사용자 취소');
        localStorage.removeItem('pendingPayment');
        setPaymentStatus('idle');
        setIsBidModalOpen(false);
      } else if (result.code === 'NO_RESPONSE') {
        // 팝업이 닫혔지만 결과를 못 받음 - 결제 상태 직접 확인
        console.log('응답 없음 - 결제 상태 확인 중...');

        // 잠시 대기 후 결제 상태 확인
        setTimeout(async () => {
          try {
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paymentId: orderId,
                productId: product.id,
                slotNumbers: selectedSlots,
                paymentMethod: 'kakaopay',
              }),
            });
            const verifyData = await verifyResponse.json();
            console.log('결제 확인 결과:', verifyData);

            if (verifyData.success) {
              localStorage.removeItem('pendingPayment');
              setCompletedPaymentId(orderId);
              setPaymentStatus('success');
              setPaymentMessage('결제가 성공적으로 완료되었습니다.');
            } else {
              // 결제가 완료되지 않음
              setPaymentStatus('failed');
              setPaymentMessage('결제가 완료되지 않았습니다. 다시 시도해 주세요.');
              localStorage.removeItem('pendingPayment');
            }
          } catch (err) {
            console.error('결제 확인 실패:', err);
            setPaymentStatus('failed');
            setPaymentMessage('결제 확인 중 오류가 발생했습니다.');
            localStorage.removeItem('pendingPayment');
          }
        }, 1000);
      } else if (result.code) {
        // 기타 에러
        console.log('결제 에러:', result.code, result.message);
        localStorage.removeItem('pendingPayment');
        setPaymentStatus('failed');
        setPaymentMessage(result.message || '결제에 실패했습니다.');
      } else {
        // code가 없으면 리다이렉트 중일 수 있음
        console.log('리다이렉트 중...');
      }
    } catch (error) {
      console.error('Payment failed:', error);
      localStorage.removeItem('pendingPayment');
      setPaymentStatus('failed');
      setPaymentMessage('결제 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentComplete = () => {
    setIsBidModalOpen(false);
    setPaymentStatus('idle');
    setSelectedSlots([]);
    if (completedPaymentId) {
      router.push(`/payment/complete?paymentId=${completedPaymentId}`);
    } else {
      // 데이터 새로고침
      fetchData();
    }
  };

  // 이미지 배열 (현재는 썸네일만 있음)
  const images = product.thumbnail_url ? [product.thumbnail_url] : [];

  return (
    <>
      {/* 대기열 오버레이 */}
      {!queue.isAllowed && queue.position > 0 && (
        <QueueOverlay
          position={queue.position}
          message={queue.message}
          onLeave={handleLeaveQueue}
        />
      )}

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 뒤로가기 */}
          <button
            onClick={() => {
              queue.disconnect();
              router.back();
            }}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            뒤로가기
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 왼쪽: 이미지 + 설명 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 메인 이미지 */}
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                <div className="relative aspect-[4/3] bg-gradient-to-br from-purple-100 to-cyan-100 flex items-center justify-center">
                  {product.thumbnail_url ? (
                    <img
                      src={product.thumbnail_url}
                      alt={product.title}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                  {images.length > 0 && (
                    <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 text-white text-sm rounded-lg">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  )}
                </div>

                {/* 썸네일 이미지 */}
                {images.length > 1 && (
                  <div className="flex gap-2 p-4 overflow-x-auto">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          currentImageIndex === index
                            ? 'border-purple-500'
                            : 'border-transparent hover:border-gray-300'
                        }`}
                      >
                        <div className="w-full h-full bg-gradient-to-br from-purple-50 to-cyan-50 flex items-center justify-center">
                          <span className="text-xs text-gray-400">{index + 1}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 상품 정보 */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{product.title}</h1>
                  {(product.category_name || product.category) && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                      {product.category_name || product.category}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{product.bid_count}명 참여</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>{product.sold_slot_count}/{product.slot_count} 슬롯 판매</span>
                  </div>
                </div>

                {product.description && (
                  <div className="border-t border-gray-100 pt-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">상품 설명</h2>
                    <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans leading-relaxed">
                      {product.description}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* 오른쪽: 대기열 + 슬롯 선택 + 입찰 */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
              {/* 대기열 목록 (슬롯 위) */}
              <QueueListPanel queueList={queue.queueList} currentUserId={userId} />

              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                {/* 가격 정보 */}
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-1">슬롯당 가격</p>
                  <p className="text-3xl font-bold text-gray-900">{formatPrice(slotPrice)}원</p>
                  <p className="text-sm text-gray-400 mt-1">시작가 {formatPrice(product.starting_price)}원</p>
                </div>

                {/* 남은 시간 */}
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl mb-6">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-600 font-medium">{getTimeRemaining()} 남음</span>
                </div>

                {/* 슬롯 선택 */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">슬롯 선택</h3>
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-sm font-medium text-emerald-700">
                        {availableSlots.length}개 가능
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-2 p-4 bg-gradient-to-br from-slate-100/80 to-slate-200/60 backdrop-blur-sm rounded-2xl">
                    {Array.from({ length: product.slot_count }, (_, i) => i + 1).map((slotNum) => {
                      const status = getSlotStatus(slotNum);
                      const isSold = status === 'sold' || status === 'reserved';
                      const isSelected = selectedSlots.includes(slotNum);

                      return (
                        <button
                          key={slotNum}
                          onClick={() => toggleSlot(slotNum)}
                          disabled={isSold}
                          className={`
                            relative aspect-square rounded-xl text-sm font-bold transition-all duration-300 overflow-hidden
                            ${isSold
                              ? 'bg-gradient-to-br from-slate-300/40 to-slate-400/30 cursor-not-allowed'
                              : isSelected
                                ? 'bg-gradient-to-br from-pink-500 to-rose-400 text-white shadow-lg shadow-pink-500/30 scale-95 ring-2 ring-pink-300/50 ring-offset-1 ring-offset-pink-50'
                                : 'bg-white/70 text-slate-600 shadow-[4px_4px_8px_rgba(0,0,0,0.08),-4px_-4px_8px_rgba(255,255,255,0.9)] hover:shadow-[2px_2px_4px_rgba(0,0,0,0.05),-2px_-2px_4px_rgba(255,255,255,0.8)] hover:scale-[0.98] active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.5)] active:scale-95'
                            }
                          `}
                        >
                          {isSold ? (
                            <>
                              <span className="text-slate-400/60 text-xs">{slotNum}</span>
                              <span className="absolute inset-0 flex items-center justify-center">
                                <span className="w-[140%] h-[1.5px] bg-gradient-to-r from-transparent via-slate-400/50 to-transparent rotate-[-45deg]"></span>
                              </span>
                            </>
                          ) : (
                            <span className={`text-lg font-light tracking-tight ${isSelected ? 'drop-shadow-sm' : ''}`}>{slotNum}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex justify-center gap-5 mt-4">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-lg bg-white/70 shadow-[3px_3px_6px_rgba(0,0,0,0.08),-3px_-3px_6px_rgba(255,255,255,0.9)]"></div>
                      <span className="text-xs text-slate-500">선택 가능</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-pink-500 to-rose-400 shadow-sm shadow-pink-500/30 ring-1 ring-pink-300/50"></div>
                      <span className="text-xs text-slate-500">선택됨</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative w-5 h-5 rounded-lg bg-gradient-to-br from-slate-300/40 to-slate-400/30 flex items-center justify-center overflow-hidden">
                        <span className="text-[8px] text-slate-400/60 font-bold">1</span>
                        <span className="absolute w-[140%] h-[1px] bg-slate-400/50 rotate-[-45deg]"></span>
                      </div>
                      <span className="text-xs text-slate-500">마감</span>
                    </div>
                  </div>
                </div>

                {/* 선택 정보 */}
                <div className={`overflow-hidden transition-all duration-300 ${selectedSlots.length > 0 ? 'max-h-40 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
                  <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border border-purple-100">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-gray-600">선택한 슬롯</span>
                      <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
                        {selectedSlots.sort((a, b) => a - b).map((slot) => (
                          <span key={slot} className="px-2 py-0.5 bg-purple-500 text-white text-xs font-bold rounded-md">
                            {slot}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-baseline pt-3 border-t border-purple-100">
                      <span className="text-sm text-gray-600">총 입찰 금액</span>
                      <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                        {formatPrice(totalBidAmount)}원
                      </span>
                    </div>
                  </div>
                </div>

                {/* 입찰 버튼 */}
                <button
                  onClick={handleBid}
                  disabled={selectedSlots.length === 0}
                  className={`
                    relative w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 overflow-hidden
                    ${selectedSlots.length > 0
                      ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white shadow-xl shadow-purple-500/25 hover:shadow-2xl hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98]'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  {selectedSlots.length > 0 && (
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full animate-[shimmer_2s_infinite]"></span>
                  )}
                  <span className="relative flex items-center justify-center gap-2">
                    {selectedSlots.length > 0 ? (
                      <>
                        <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm">
                          {selectedSlots.length}
                        </span>
                        슬롯 입찰하기
                      </>
                    ) : (
                      '슬롯을 선택해주세요'
                    )}
                  </span>
                </button>

                {/* 안내 문구 */}
                <p className="text-xs text-gray-400 text-center mt-4 flex items-center justify-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  즉시 결제 · 결제 후 취소 불가
                </p>
              </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 입찰 확인 모달 */}
      <BidConfirmModal
        isOpen={isBidModalOpen}
        onClose={() => {
          if (!isProcessing && paymentStatus !== 'processing') {
            setIsBidModalOpen(false);
            setPaymentStatus('idle');
          }
        }}
        onConfirm={handleConfirmBid}
        onComplete={handlePaymentComplete}
        productTitle={product.title}
        productImage={product.thumbnail_url}
        selectedSlots={selectedSlots}
        slotPrice={slotPrice}
        totalAmount={totalBidAmount}
        isProcessing={isProcessing}
        paymentStatus={paymentStatus}
        paymentMessage={paymentMessage}
      />
    </>
  );
}
