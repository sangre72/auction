'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '@auction/shared';
import { PAYMENT_CHANNELS, PaymentMethod } from '@/lib/payment';

interface BidConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentMethod: PaymentMethod) => void;
  onComplete?: () => void;
  productTitle: string;
  productImage?: string;
  selectedSlots: number[];
  slotPrice: number;
  totalAmount: number;
  isProcessing?: boolean;
  paymentStatus?: 'idle' | 'processing' | 'success' | 'failed';
  paymentMessage?: string;
}

export function BidConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  onComplete,
  productTitle,
  productImage,
  selectedSlots,
  slotPrice,
  totalAmount,
  isProcessing = false,
  paymentStatus = 'idle',
  paymentMessage,
}: BidConfirmModalProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('kakaopay');

  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isProcessing) onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isProcessing, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isProcessing && onClose()}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* 모달 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
          >
            <div className="w-full md:max-w-md bg-white md:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden max-h-[90vh] md:max-h-[85vh] flex flex-col">
              {/* 헤더 - 모바일 드래그 핸들 */}
              <div className="md:hidden flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>

              {/* 헤더 */}
              <div className="px-6 pt-4 pb-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">결제 확인</h2>
                  <button
                    onClick={onClose}
                    disabled={isProcessing}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* 컨텐츠 */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* 결제 완료 상태 */}
                {paymentStatus === 'success' && (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">결제 완료!</h3>
                    <p className="text-gray-500 mb-4">{paymentMessage || '결제가 성공적으로 완료되었습니다.'}</p>

                    <div className="bg-green-50 rounded-2xl p-4 mb-6 text-left">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">구매 슬롯</span>
                        <span className="text-green-700 font-bold">{selectedSlots.length}개</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">결제 금액</span>
                        <span className="text-green-700 font-bold">{formatPrice(totalAmount)}원</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 결제 실패 상태 */}
                {paymentStatus === 'failed' && (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">결제 실패</h3>
                    <p className="text-gray-500">{paymentMessage || '결제 중 오류가 발생했습니다.'}</p>
                  </div>
                )}

                {/* 결제 진행 중 또는 대기 상태 */}
                {(paymentStatus === 'idle' || paymentStatus === 'processing') && (
                  <>
                    {/* 상품 정보 */}
                    <div className="flex gap-4 mb-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-cyan-100 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                        {productImage ? (
                          <img src={productImage} alt={productTitle} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl">🎭</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 line-clamp-2">{productTitle}</h3>
                        <p className="text-sm text-gray-500 mt-1">슬롯당 {formatPrice(slotPrice)}원</p>
                      </div>
                    </div>

                    {/* 선택한 슬롯 */}
                    <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-600">선택한 슬롯</span>
                        <span className="text-sm text-purple-600 font-bold">{selectedSlots.length}개</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedSlots.sort((a, b) => a - b).map((slot) => (
                          <span
                            key={slot}
                            className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white text-sm font-bold rounded-lg shadow-sm"
                          >
                            {slot}번
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* 결제 금액 */}
                    <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-2xl p-5 border border-purple-100">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">슬롯 가격</span>
                        <span className="text-gray-900">{formatPrice(slotPrice)}원 x {selectedSlots.length}</span>
                      </div>
                      <div className="h-px bg-purple-200 my-3" />
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">총 결제 금액</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                          {formatPrice(totalAmount)}원
                        </span>
                      </div>
                    </div>

                    {/* 결제 수단 선택 */}
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">결제 수단 선택</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {(Object.entries(PAYMENT_CHANNELS) as [PaymentMethod, typeof PAYMENT_CHANNELS[PaymentMethod]][]).map(([key, channel]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setSelectedPaymentMethod(key)}
                            disabled={isProcessing}
                            className={`relative p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                              selectedPaymentMethod === key
                                ? 'border-purple-500 bg-purple-50 shadow-md'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {selectedPaymentMethod === key && (
                              <div className="absolute top-2 right-2">
                                <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                            <span className="text-2xl">{channel.icon}</span>
                            <span className={`font-medium ${selectedPaymentMethod === key ? 'text-purple-700' : 'text-gray-700'}`}>
                              {channel.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 안내 문구 */}
                    <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                      <div className="flex gap-3">
                        <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div className="text-sm text-amber-800">
                          <p className="font-medium mb-1">결제 전 확인해주세요</p>
                          <ul className="text-amber-700 space-y-0.5">
                            <li>- 결제 완료 후 취소가 불가합니다</li>
                            <li>- 결제 버튼 클릭 시 즉시 결제됩니다</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* 버튼 영역 */}
              <div className="p-6 pt-4 border-t border-gray-100 bg-white">
                {paymentStatus === 'success' ? (
                  <button
                    onClick={onComplete}
                    className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-400 hover:to-emerald-400 transition-all shadow-lg shadow-green-500/25 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    확인
                  </button>
                ) : paymentStatus === 'failed' ? (
                  <div className="flex gap-3">
                    <button
                      onClick={onClose}
                      className="flex-1 py-4 px-6 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      닫기
                    </button>
                    <button
                      onClick={() => onConfirm(selectedPaymentMethod)}
                      className="flex-1 py-4 px-6 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-fuchsia-500 transition-all"
                    >
                      다시 시도
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={onClose}
                      disabled={isProcessing}
                      className="flex-1 py-4 px-6 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      취소
                    </button>
                    <button
                      onClick={() => onConfirm(selectedPaymentMethod)}
                      disabled={isProcessing}
                      className="flex-[2] py-4 px-6 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          처리 중...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          결제하기
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
