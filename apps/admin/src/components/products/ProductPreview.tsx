'use client';

import { useState } from 'react';
import { formatPrice } from '@auction/shared';

interface ProductPreviewData {
  title: string;
  description: string;
  category_id?: number | null;
  category_name?: string;
  auction_type: string;
  images: string[];
  slot_count: number;
  slot_price: number;
  starting_price: number;
  buy_now_price?: number | null;
  start_time: Date | null;
  end_time: Date | null;
  bid_count?: number;
  view_count?: number;
}

interface ProductPreviewProps {
  data: ProductPreviewData;
  onClose?: () => void;
}


export function ProductPreview({ data, onClose }: ProductPreviewProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);

  const isSlotAuction = data.auction_type === 'slot';
  const currentPrice = isSlotAuction ? data.slot_price : data.starting_price;

  const getTimeRemaining = () => {
    if (!data.end_time) return '미설정';
    const now = new Date();
    const diff = data.end_time.getTime() - now.getTime();

    if (diff <= 0) return '종료됨';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}일 ${hours}시간 ${minutes}분`;
    if (hours > 0) return `${hours}시간 ${minutes}분`;
    return `${minutes}분`;
  };

  // 슬롯 경매용: 데모 슬롯 생성 (일부는 sold 상태)
  const demoSlots = Array.from({ length: data.slot_count }, (_, i) => ({
    number: i + 1,
    isSold: i % 5 === 0 && i !== 0, // 5, 10, 15... 번호는 sold 상태로 데모
  }));

  const toggleSlot = (slotNumber: number) => {
    const slot = demoSlots.find(s => s.number === slotNumber);
    if (slot?.isSold) return;

    setSelectedSlots((prev) =>
      prev.includes(slotNumber)
        ? prev.filter((s) => s !== slotNumber)
        : [...prev, slotNumber]
    );
  };

  const totalBidAmount = selectedSlots.length * (data.slot_price || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-gray-50 rounded-2xl overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-lg">
              미리보기
            </div>
            <span className="text-gray-500 text-sm">
              실제 유저 화면에서 이렇게 보입니다
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 컨텐츠 */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* 왼쪽: 이미지 + 설명 */}
              <div className="lg:col-span-2 space-y-6">
                {/* 메인 이미지 */}
                <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-purple-100 to-cyan-100 flex items-center justify-center">
                    {data.images.length > 0 ? (
                      <img
                        src={data.images[currentImageIndex]}
                        alt={data.title}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                    {data.images.length > 0 && (
                      <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/60 text-white text-sm rounded-lg">
                        {currentImageIndex + 1} / {data.images.length}
                      </div>
                    )}
                  </div>

                  {/* 썸네일 이미지 */}
                  {data.images.length > 1 && (
                    <div className="flex gap-2 p-4 overflow-x-auto">
                      {data.images.map((src, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                            currentImageIndex === index
                              ? 'border-purple-500'
                              : 'border-transparent hover:border-gray-300'
                          }`}
                        >
                          <img src={src} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* 상품 정보 */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                      {data.category_name || '미분류'}
                    </span>
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-600 text-xs rounded">
                      {isSlotAuction ? '슬롯 경매' : '일반 경매'}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {data.title || '상품명을 입력해주세요'}
                  </h1>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{data.bid_count || 0}명 참여</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>{data.view_count || 0} 조회</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">상품 설명</h2>
                    {data.description ? (
                      <div
                        className="prose max-w-none text-gray-600"
                        dangerouslySetInnerHTML={{ __html: data.description }}
                      />
                    ) : (
                      <p className="text-gray-400">상품 설명을 입력해주세요</p>
                    )}
                  </div>
                </div>
              </div>

              {/* 오른쪽: 슬롯 선택 + 입찰 */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 sticky top-4">
                  {/* 가격 정보 */}
                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-1">
                      {isSlotAuction ? '슬롯당 가격' : '시작가'}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">{formatPrice(currentPrice)}원</p>
                    {isSlotAuction && (
                      <p className="text-sm text-gray-400 mt-1">
                        총 가치 {formatPrice(data.slot_count * data.slot_price)}원
                      </p>
                    )}
                  </div>

                  {/* 남은 시간 */}
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl mb-6">
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-red-600 font-medium">{getTimeRemaining()} 남음</span>
                  </div>

                  {/* 슬롯 선택 (슬롯 경매일 때만) */}
                  {isSlotAuction && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">슬롯 선택</h3>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span className="text-sm font-medium text-emerald-700">
                            {demoSlots.filter(s => !s.isSold).length}개 가능
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-5 gap-2 p-4 bg-gradient-to-br from-slate-100/80 to-slate-200/60 backdrop-blur-sm rounded-2xl max-h-60 overflow-y-auto">
                        {demoSlots.slice(0, Math.min(data.slot_count, 50)).map((slot) => {
                          const isSelected = selectedSlots.includes(slot.number);

                          return (
                            <button
                              key={slot.number}
                              onClick={() => toggleSlot(slot.number)}
                              disabled={slot.isSold}
                              className={`
                                relative aspect-square rounded-xl text-sm font-bold transition-all duration-300 overflow-hidden
                                ${slot.isSold
                                  ? 'bg-gradient-to-br from-slate-300/40 to-slate-400/30 cursor-not-allowed'
                                  : isSelected
                                    ? 'bg-gradient-to-br from-pink-500 to-rose-400 text-white shadow-lg shadow-pink-500/30 scale-95 ring-2 ring-pink-300/50'
                                    : 'bg-white/70 text-slate-600 shadow-[4px_4px_8px_rgba(0,0,0,0.08),-4px_-4px_8px_rgba(255,255,255,0.9)] hover:scale-[0.98]'
                                }
                              `}
                            >
                              {slot.isSold ? (
                                <>
                                  <span className="text-slate-400/60 text-xs">{slot.number}</span>
                                  <span className="absolute inset-0 flex items-center justify-center">
                                    <span className="w-[140%] h-[1.5px] bg-gradient-to-r from-transparent via-slate-400/50 to-transparent rotate-[-45deg]"></span>
                                  </span>
                                </>
                              ) : (
                                <span className={`text-lg font-light tracking-tight ${isSelected ? 'drop-shadow-sm' : ''}`}>
                                  {slot.number}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {data.slot_count > 50 && (
                        <p className="text-center text-xs text-gray-400 mt-2">
                          ... 외 {data.slot_count - 50}개 슬롯 (미리보기에서는 50개만 표시)
                        </p>
                      )}

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
                            <span className="absolute w-[140%] h-[1px] bg-slate-400/50 rotate-[-45deg]"></span>
                          </div>
                          <span className="text-xs text-slate-500">마감</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 선택 정보 (슬롯 경매) */}
                  {isSlotAuction && (
                    <div className={`overflow-hidden transition-all duration-300 ${selectedSlots.length > 0 ? 'max-h-40 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
                      <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border border-purple-100">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm text-gray-600">선택한 슬롯</span>
                          <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
                            {selectedSlots.sort((a, b) => a - b).slice(0, 10).map((slot) => (
                              <span key={slot} className="px-2 py-0.5 bg-purple-500 text-white text-xs font-bold rounded-md">
                                {slot}
                              </span>
                            ))}
                            {selectedSlots.length > 10 && (
                              <span className="text-xs text-gray-500">+{selectedSlots.length - 10}</span>
                            )}
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
                  )}

                  {/* 입찰 버튼 */}
                  <button
                    disabled
                    className="relative w-full py-4 rounded-2xl font-bold text-lg bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white shadow-xl shadow-purple-500/25 cursor-not-allowed opacity-80"
                  >
                    <span className="relative flex items-center justify-center gap-2">
                      {isSlotAuction ? (
                        selectedSlots.length > 0 ? (
                          <>
                            <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm">
                              {selectedSlots.length}
                            </span>
                            슬롯 입찰하기
                          </>
                        ) : (
                          '슬롯을 선택해주세요'
                        )
                      ) : (
                        '입찰하기'
                      )}
                    </span>
                  </button>

                  {/* 안내 문구 */}
                  <p className="text-xs text-gray-400 text-center mt-4 flex items-center justify-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    미리보기 모드 - 실제 입찰은 불가합니다
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
