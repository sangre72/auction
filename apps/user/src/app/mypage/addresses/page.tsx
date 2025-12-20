'use client';

import { useState } from 'react';

interface Address {
  id: string;
  alias: string;
  recipientName: string;
  phone: string;
  zipcode: string;
  address1: string;
  address2: string;
  isDefault: boolean;
}

// 임시 데이터
const initialAddresses: Address[] = [
  {
    id: '1',
    alias: '집',
    recipientName: '홍길동',
    phone: '010-1234-5678',
    zipcode: '06234',
    address1: '서울특별시 강남구 테헤란로 123',
    address2: '아파트 101동 1001호',
    isDefault: true,
  },
  {
    id: '2',
    alias: '회사',
    recipientName: '홍길동',
    phone: '010-1234-5678',
    zipcode: '04524',
    address1: '서울특별시 중구 을지로 100',
    address2: '오피스빌딩 15층',
    isDefault: false,
  },
];

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [isAdding, setIsAdding] = useState(false);

  const handleSetDefault = (id: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id,
    })));
  };

  const handleDelete = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      setAddresses(addresses.filter(addr => addr.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">배송지 관리</h1>
            <p className="text-gray-500 text-sm mt-1">배송지를 추가하고 관리하세요</p>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            배송지 추가
          </button>
        </div>
      </div>

      {/* 배송지 목록 */}
      <div className="space-y-4">
        {addresses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-16 text-center">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-gray-500">등록된 배송지가 없습니다</p>
            <button
              onClick={() => setIsAdding(true)}
              className="mt-4 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              배송지 추가하기
            </button>
          </div>
        ) : (
          addresses.map((address) => (
            <div
              key={address.id}
              className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${
                address.isDefault ? 'border-purple-300 ring-1 ring-purple-100' : 'border-gray-100'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{address.alias}</span>
                    {address.isDefault && (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                        기본 배송지
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(address.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="font-medium">{address.recipientName}</span>
                    <span className="text-gray-300">|</span>
                    <span>{address.phone}</span>
                  </div>
                  <p className="text-gray-600">
                    [{address.zipcode}] {address.address1}
                  </p>
                  <p className="text-gray-600">{address.address2}</p>
                </div>

                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    className="mt-4 px-4 py-2 text-sm font-medium text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
                  >
                    기본 배송지로 설정
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 배송지 추가 모달 (간단 버전) */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">새 배송지 추가</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">배송지 별칭</label>
                <input
                  type="text"
                  placeholder="예: 집, 회사"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">수령인</label>
                <input
                  type="text"
                  placeholder="수령인 이름"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
                <input
                  type="tel"
                  placeholder="010-0000-0000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">주소</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="우편번호"
                    className="w-32 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                  <button className="px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors">
                    주소 검색
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="기본 주소"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 mb-2"
                  readOnly
                />
                <input
                  type="text"
                  placeholder="상세 주소 입력"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setIsAdding(false)}
                className="flex-1 px-4 py-3 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="flex-1 px-4 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
