'use client';

import { useState } from 'react';
import { formatNumber } from '@auction/shared';

type CouponStatus = 'available' | 'used' | 'expired';

interface Coupon {
  id: string;
  name: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  status: CouponStatus;
  expiryDate: string;
  usedDate?: string;
}

const statusTabs: { key: CouponStatus | 'all'; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'available', label: '사용 가능' },
  { key: 'used', label: '사용 완료' },
  { key: 'expired', label: '기간 만료' },
];

// 임시 데이터
const coupons: Coupon[] = [
  {
    id: '1',
    name: '신규 가입 축하 쿠폰',
    discountType: 'percent',
    discountValue: 10,
    minOrderAmount: 50000,
    maxDiscount: 10000,
    status: 'available',
    expiryDate: '2024-02-28',
  },
  {
    id: '2',
    name: '첫 경매 낙찰 기념',
    discountType: 'fixed',
    discountValue: 5000,
    minOrderAmount: 30000,
    status: 'available',
    expiryDate: '2024-03-31',
  },
  {
    id: '3',
    name: 'VIP 고객 특별 할인',
    discountType: 'percent',
    discountValue: 15,
    minOrderAmount: 100000,
    maxDiscount: 20000,
    status: 'available',
    expiryDate: '2024-01-31',
  },
  {
    id: '4',
    name: '연말 이벤트 쿠폰',
    discountType: 'fixed',
    discountValue: 3000,
    minOrderAmount: 20000,
    status: 'used',
    expiryDate: '2024-01-15',
    usedDate: '2024-01-10',
  },
];

export default function CouponsPage() {
  const [activeTab, setActiveTab] = useState<CouponStatus | 'all'>('all');
  const [couponCode, setCouponCode] = useState('');

  const filteredCoupons = activeTab === 'all'
    ? coupons
    : coupons.filter(c => c.status === activeTab);

  const availableCount = coupons.filter(c => c.status === 'available').length;

  const getDiscountText = (coupon: Coupon) => {
    if (coupon.discountType === 'percent') {
      return `${coupon.discountValue}%`;
    }
    return `${formatNumber(coupon.discountValue)}원`;
  };

  const handleRegisterCoupon = () => {
    if (!couponCode.trim()) {
      alert('쿠폰 코드를 입력해주세요');
      return;
    }
    alert('쿠폰이 등록되었습니다!');
    setCouponCode('');
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">쿠폰</h1>
            <p className="text-gray-500 text-sm mt-1">보유한 쿠폰을 확인하고 관리하세요</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">사용 가능</p>
            <p className="text-2xl font-bold text-purple-600">{availableCount}장</p>
          </div>
        </div>

        {/* 쿠폰 등록 */}
        <div className="flex gap-2">
          <input
            type="text"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="쿠폰 코드를 입력하세요"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            onClick={handleRegisterCoupon}
            className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            등록
          </button>
        </div>
      </div>

      {/* 탭 & 쿠폰 목록 */}
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

        <div className="p-4 space-y-4">
          {filteredCoupons.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <p className="text-gray-500">쿠폰이 없습니다</p>
            </div>
          ) : (
            filteredCoupons.map((coupon) => (
              <div
                key={coupon.id}
                className={`relative overflow-hidden rounded-xl border-2 ${
                  coupon.status === 'available'
                    ? 'border-purple-200 bg-gradient-to-r from-purple-50 to-white'
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                {/* 쿠폰 컷 */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-white rounded-r-full border-r-2 border-t-2 border-b-2 border-gray-200 -ml-px" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-white rounded-l-full border-l-2 border-t-2 border-b-2 border-gray-200 -mr-px" />

                <div className="flex">
                  {/* 할인 금액 */}
                  <div className="w-32 p-4 flex flex-col items-center justify-center border-r-2 border-dashed border-gray-200">
                    <span className={`text-3xl font-bold ${
                      coupon.status === 'available' ? 'text-purple-600' : 'text-gray-400'
                    }`}>
                      {getDiscountText(coupon)}
                    </span>
                    {coupon.discountType === 'percent' && coupon.maxDiscount && (
                      <span className="text-xs text-gray-400 mt-1">
                        최대 {formatNumber(coupon.maxDiscount)}원
                      </span>
                    )}
                  </div>

                  {/* 쿠폰 정보 */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`font-bold ${
                          coupon.status === 'available' ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {coupon.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatNumber(coupon.minOrderAmount)}원 이상 구매 시 사용
                        </p>
                      </div>
                      {coupon.status !== 'available' && (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          coupon.status === 'used' ? 'bg-gray-200 text-gray-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {coupon.status === 'used' ? '사용 완료' : '기간 만료'}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                      <span>유효기간: {coupon.expiryDate}까지</span>
                      {coupon.usedDate && (
                        <>
                          <span>|</span>
                          <span>사용일: {coupon.usedDate}</span>
                        </>
                      )}
                    </div>
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
