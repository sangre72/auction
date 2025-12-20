'use client';

import { useState } from 'react';

type OrderStatus = 'all' | 'pending' | 'paid' | 'preparing' | 'shipping' | 'delivered' | 'cancelled';

interface Order {
  id: string;
  orderNumber: string;
  productName: string;
  image: string;
  price: number;
  status: OrderStatus;
  statusText: string;
  orderDate: string;
  deliveryDate?: string;
  trackingNumber?: string;
}

const statusTabs: { key: OrderStatus; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'pending', label: '결제대기' },
  { key: 'paid', label: '결제완료' },
  { key: 'preparing', label: '배송준비' },
  { key: 'shipping', label: '배송중' },
  { key: 'delivered', label: '배송완료' },
  { key: 'cancelled', label: '취소/반품' },
];

// 임시 데이터
const orders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024011501',
    productName: '원피스 루피 기어5 피규어 1/6 스케일',
    image: '',
    price: 125000,
    status: 'shipping',
    statusText: '배송 중',
    orderDate: '2024-01-15',
    trackingNumber: '123456789012',
  },
  {
    id: '2',
    orderNumber: 'ORD-2024011401',
    productName: '드래곤볼 손오공 울트라 인스팅트 피규어',
    image: '',
    price: 89000,
    status: 'preparing',
    statusText: '배송 준비 중',
    orderDate: '2024-01-14',
  },
  {
    id: '3',
    orderNumber: 'ORD-2024011001',
    productName: '나루토 우즈마키 나루토 선인모드',
    image: '',
    price: 156000,
    status: 'delivered',
    statusText: '배송 완료',
    orderDate: '2024-01-10',
    deliveryDate: '2024-01-13',
  },
];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<OrderStatus>('all');

  const filteredOrders = activeTab === 'all'
    ? orders
    : orders.filter(order => order.status === activeTab);

  const formatPrice = (price: number) => price.toLocaleString('ko-KR');

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-700';
      case 'paid': return 'bg-blue-100 text-blue-700';
      case 'preparing': return 'bg-indigo-100 text-indigo-700';
      case 'shipping': return 'bg-orange-100 text-orange-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-xl font-bold text-gray-900">주문/배송 조회</h1>
        <p className="text-gray-500 text-sm mt-1">주문 내역과 배송 상태를 확인하세요</p>
      </div>

      {/* 탭 */}
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

        {/* 주문 목록 */}
        <div className="divide-y divide-gray-100">
          {filteredOrders.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-gray-500">주문 내역이 없습니다</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="p-6">
                {/* 주문 헤더 */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-900">{order.orderDate}</span>
                    <span className="text-sm text-gray-400">{order.orderNumber}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.statusText}
                  </span>
                </div>

                {/* 상품 정보 */}
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-cyan-100 rounded-lg flex items-center justify-center text-3xl shrink-0">
                    🎭
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{order.productName}</p>
                    <p className="text-lg font-bold text-purple-600 mt-1">{formatPrice(order.price)}원</p>
                    {order.trackingNumber && (
                      <p className="text-sm text-gray-500 mt-1">
                        운송장: {order.trackingNumber}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button className="px-4 py-2 text-sm font-medium text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors">
                      상세보기
                    </button>
                    {order.status === 'shipping' && (
                      <button className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
                        배송조회
                      </button>
                    )}
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
