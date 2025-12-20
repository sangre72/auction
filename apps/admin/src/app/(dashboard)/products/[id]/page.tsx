'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Badge, Card, Tabs, Alert, Input, Select } from '@/components/ui';
import { DateTimePicker } from '@/components/forms/DateTimePicker';
import { TipTapEditor } from '@/components/editor/TipTapEditor';
import { ProductPreview } from '@/components/products/ProductPreview';
import { productsApi, slotsApi, Product, SlotListItem, SlotStats } from '@/lib/api';

type ProductStatus = 'pending' | 'approved' | 'active' | 'ended' | 'cancelled' | 'rejected';
type SlotStatus = 'available' | 'reserved' | 'purchased' | 'cancelled';

const statusConfig: Record<ProductStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }> = {
  pending: { label: '대기중', variant: 'warning' },
  approved: { label: '승인됨', variant: 'info' },
  active: { label: '진행중', variant: 'success' },
  ended: { label: '종료', variant: 'default' },
  cancelled: { label: '취소', variant: 'danger' },
  rejected: { label: '반려', variant: 'danger' },
};

const slotStatusConfig: Record<SlotStatus, { label: string; color: string }> = {
  available: { label: '구매 가능', color: 'bg-emerald-500' },
  reserved: { label: '예약중', color: 'bg-amber-500' },
  purchased: { label: '구매 완료', color: 'bg-purple-500' },
  cancelled: { label: '취소됨', color: 'bg-gray-500' },
};


export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = Number(params.id);

  const [product, setProduct] = useState<Product | null>(null);
  const [slots, setSlots] = useState<SlotListItem[]>([]);
  const [slotStats, setSlotStats] = useState<SlotStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Product>>({});
  const [showPreview, setShowPreview] = useState(false);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productsApi.getById(productId);
      setProduct(response.data);
      setEditData(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch product:', err);
      setError('상품 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const fetchSlots = useCallback(async () => {
    try {
      const [slotsRes, statsRes] = await Promise.all([
        slotsApi.getByProduct(productId),
        slotsApi.getStats(productId),
      ]);
      setSlots(slotsRes.data);
      setSlotStats(statsRes.data);
    } catch (err) {
      console.error('Failed to fetch slots:', err);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
    fetchSlots();
  }, [fetchProduct, fetchSlots]);

  const handleApprove = async () => {
    try {
      await productsApi.approve(productId);
      fetchProduct();
    } catch (err) {
      console.error('Failed to approve:', err);
      alert('승인에 실패했습니다.');
    }
  };

  const handleReject = async () => {
    try {
      await productsApi.reject(productId);
      fetchProduct();
    } catch (err) {
      console.error('Failed to reject:', err);
      alert('반려에 실패했습니다.');
    }
  };

  const handleToggleFeatured = async () => {
    if (!product) return;
    try {
      await productsApi.setFeatured(productId, !product.is_featured);
      fetchProduct();
    } catch (err) {
      console.error('Failed to toggle featured:', err);
      alert('추천 상품 설정에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
    try {
      await productsApi.delete(productId);
      router.push('/products');
    } catch (err) {
      console.error('Failed to delete:', err);
      alert('삭제에 실패했습니다.');
    }
  };

  const handleSave = async () => {
    try {
      await productsApi.update(productId, editData);
      setIsEditing(false);
      fetchProduct();
    } catch (err) {
      console.error('Failed to save:', err);
      alert('저장에 실패했습니다.');
    }
  };

  const handleSlotCancel = async (slotId: number) => {
    if (!confirm('슬롯을 취소하시겠습니까?')) return;
    try {
      await slotsApi.cancel(slotId);
      fetchSlots();
    } catch (err) {
      console.error('Failed to cancel slot:', err);
      alert('슬롯 취소에 실패했습니다.');
    }
  };

  const handleSlotReset = async (slotId: number) => {
    if (!confirm('슬롯을 초기화하시겠습니까? 구매 가능 상태로 변경됩니다.')) return;
    try {
      await slotsApi.reset(slotId);
      fetchSlots();
    } catch (err) {
      console.error('Failed to reset slot:', err);
      alert('슬롯 초기화에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
        <span className="ml-3 text-gray-400">불러오는 중...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="space-y-4">
        <Alert variant="danger" title="오류">
          {error || '상품을 찾을 수 없습니다.'}
        </Alert>
        <Button variant="outline" onClick={() => router.back()}>
          뒤로 가기
        </Button>
      </div>
    );
  }

  const tabs = [
    { id: 'info', label: '기본 정보' },
    { id: 'slots', label: `슬롯 (${slotStats?.total || 0})` },
  ];

  const statusConf = statusConfig[product.status as ProductStatus] || { label: product.status, variant: 'default' as const };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeftIcon />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{product.title}</h1>
              <Badge variant={statusConf.variant}>{statusConf.label}</Badge>
              {product.is_featured && <Badge variant="warning">추천</Badge>}
            </div>
            <p className="text-gray-400 mt-1">
              {product.category_name || '미분류'} |
              {product.auction_type === 'slot' ? ' 슬롯 경매' : ' 일반 경매'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            미리보기
          </Button>
          {product.status === 'pending' && (
            <>
              <Button variant="outline" className="text-emerald-400" onClick={handleApprove}>
                승인
              </Button>
              <Button variant="outline" className="text-red-400" onClick={handleReject}>
                반려
              </Button>
            </>
          )}
          <Button variant="outline" onClick={handleToggleFeatured}>
            {product.is_featured ? '추천 해제' : '추천 설정'}
          </Button>
          <Button variant="outline" className="text-red-400" onClick={handleDelete}>
            삭제
          </Button>
        </div>
      </div>

      {/* 탭 */}
      <Card className="p-4">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </Card>

      {/* 기본 정보 탭 */}
      {activeTab === 'info' && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* 왼쪽: 이미지 */}
          <Card className="p-4 lg:col-span-1">
            <h3 className="text-lg font-semibold text-white mb-4">상품 이미지</h3>
            <div className="aspect-square rounded-xl bg-slate-700 overflow-hidden">
              {product.thumbnail_url ? (
                <img src={product.thumbnail_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  이미지 없음
                </div>
              )}
            </div>
          </Card>

          {/* 오른쪽: 정보 */}
          <Card className="p-6 lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">상품 정보</h3>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  수정
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setIsEditing(false); setEditData(product); }}>
                    취소
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    저장
                  </Button>
                </div>
              )}
            </div>

            {isEditing ? (
              // 수정 모드
              <div className="space-y-4">
                <Input
                  label="상품명"
                  value={editData.title || ''}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                />
                <Select
                  label="상태"
                  options={[
                    { value: 'pending', label: '대기중' },
                    { value: 'approved', label: '승인됨' },
                    { value: 'active', label: '진행중' },
                    { value: 'ended', label: '종료' },
                    { value: 'cancelled', label: '취소' },
                  ]}
                  value={editData.status || ''}
                  onChange={(value) => setEditData({ ...editData, status: value })}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <DateTimePicker
                    label="시작일"
                    value={editData.start_time ? new Date(editData.start_time) : null}
                    onChange={(date) => setEditData({ ...editData, start_time: date?.toISOString() })}
                  />
                  <DateTimePicker
                    label="종료일"
                    value={editData.end_time ? new Date(editData.end_time) : null}
                    onChange={(date) => setEditData({ ...editData, end_time: date?.toISOString() })}
                  />
                </div>
              </div>
            ) : (
              // 보기 모드
              <div className="grid gap-4 md:grid-cols-2">
                <InfoItem label="판매자 ID" value={product.seller_id.toString()} />
                <InfoItem label="상품 ID" value={product.id.toString()} />
                <InfoItem
                  label={product.auction_type === 'slot' ? '슬롯당 가격' : '시작가'}
                  value={`${(product.slot_price || product.starting_price).toLocaleString()}원`}
                  highlight
                />
                <InfoItem
                  label={product.auction_type === 'slot' ? '슬롯 수' : '현재가'}
                  value={product.auction_type === 'slot'
                    ? `${product.sold_slot_count}/${product.slot_count}`
                    : `${(product.current_price || 0).toLocaleString()}원`}
                />
                {product.buy_now_price && (
                  <InfoItem label="즉시 구매가" value={`${product.buy_now_price.toLocaleString()}원`} />
                )}
                <InfoItem label="입찰 수" value={`${product.bid_count}건`} />
                <InfoItem
                  label="경매 시작"
                  value={product.start_time ? new Date(product.start_time).toLocaleString('ko-KR') : '-'}
                />
                <InfoItem
                  label="경매 종료"
                  value={product.end_time ? new Date(product.end_time).toLocaleString('ko-KR') : '-'}
                />
                <InfoItem
                  label="등록일"
                  value={new Date(product.created_at).toLocaleString('ko-KR')}
                />
                <InfoItem
                  label="수정일"
                  value={new Date(product.updated_at).toLocaleString('ko-KR')}
                />
              </div>
            )}
          </Card>

          {/* 상품 설명 */}
          <Card className="p-6 lg:col-span-3">
            <h3 className="text-lg font-semibold text-white mb-4">상품 설명</h3>
            {isEditing ? (
              <TipTapEditor
                content={editData.description || ''}
                onChange={(content) => setEditData({ ...editData, description: content })}
              />
            ) : (
              <div
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description || '설명 없음' }}
              />
            )}
          </Card>
        </div>
      )}

      {/* 슬롯 관리 탭 */}
      {activeTab === 'slots' && (
        <div className="space-y-6">
          {/* 슬롯 통계 */}
          {slotStats && (
            <div className="grid gap-4 md:grid-cols-4">
              <SlotStatCard label="전체" value={slotStats.total} color="purple" />
              <SlotStatCard label="구매 가능" value={slotStats.available} color="emerald" />
              <SlotStatCard label="예약중" value={slotStats.reserved} color="amber" />
              <SlotStatCard label="구매 완료" value={slotStats.purchased} color="cyan" />
            </div>
          )}

          {/* 슬롯 그리드 */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">슬롯 현황</h3>
            {slots.length === 0 ? (
              <p className="text-gray-400 text-center py-8">슬롯이 없습니다.</p>
            ) : (
              <div className="grid grid-cols-10 gap-2">
                {slots.map((slot) => {
                  const config = slotStatusConfig[slot.status as SlotStatus] || { label: slot.status, color: 'bg-gray-500' };
                  return (
                    <div
                      key={slot.id}
                      className={`relative aspect-square rounded-lg ${config.color} flex items-center justify-center cursor-pointer group transition-transform hover:scale-105`}
                      title={`슬롯 ${slot.slot_number}: ${config.label}`}
                    >
                      <span className="text-xs font-medium text-white">{slot.slot_number}</span>

                      {/* 호버 메뉴 */}
                      {slot.status !== 'available' && (
                        <div className="absolute inset-0 bg-black/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                          <span className="text-[10px] text-white">{config.label}</span>
                          <div className="flex gap-1">
                            {slot.status === 'reserved' && (
                              <button
                                onClick={() => handleSlotCancel(slot.id)}
                                className="p-1 bg-red-500/50 hover:bg-red-500 rounded text-[8px] text-white"
                              >
                                취소
                              </button>
                            )}
                            {(slot.status === 'purchased' || slot.status === 'cancelled') && (
                              <button
                                onClick={() => handleSlotReset(slot.id)}
                                className="p-1 bg-blue-500/50 hover:bg-blue-500 rounded text-[8px] text-white"
                              >
                                초기화
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* 범례 */}
            <div className="flex gap-6 mt-6 pt-4 border-t border-white/10">
              {Object.entries(slotStatusConfig).map(([status, config]) => (
                <div key={status} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${config.color}`}></div>
                  <span className="text-sm text-gray-400">{config.label}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* 슬롯 목록 테이블 */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">슬롯 상세 목록</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">번호</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">상태</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">구매자</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">결제금액</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">구매일시</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {slots.slice(0, 20).map((slot) => {
                    const config = slotStatusConfig[slot.status as SlotStatus] || { label: slot.status, color: 'bg-gray-500' };
                    return (
                      <tr key={slot.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4 text-white">{slot.slot_number}</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={slot.status === 'purchased' ? 'success' : slot.status === 'reserved' ? 'warning' : 'default'}
                          >
                            {config.label}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-400">{slot.buyer_id || '-'}</td>
                        <td className="py-3 px-4 text-purple-400">
                          {slot.paid_price ? `${slot.paid_price.toLocaleString()}원` : '-'}
                        </td>
                        <td className="py-3 px-4 text-gray-500 text-sm">
                          {slot.purchased_at ? new Date(slot.purchased_at).toLocaleString('ko-KR') : '-'}
                        </td>
                        <td className="py-3 px-4">
                          {slot.status !== 'available' && (
                            <div className="flex gap-2">
                              {slot.status === 'reserved' && (
                                <Button variant="ghost" size="sm" className="text-red-400" onClick={() => handleSlotCancel(slot.id)}>
                                  취소
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" onClick={() => handleSlotReset(slot.id)}>
                                초기화
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {slots.length > 20 && (
                <p className="text-center text-gray-400 text-sm mt-4">
                  ... 외 {slots.length - 20}개 슬롯
                </p>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* 미리보기 모달 */}
      {showPreview && product && (
        <ProductPreview
          data={{
            title: product.title,
            description: product.description || '',
            category_id: product.category_id,
            category_name: product.category_name,
            auction_type: product.auction_type,
            images: product.thumbnail_url ? [product.thumbnail_url] : [],
            slot_count: product.slot_count,
            slot_price: product.slot_price || 0,
            starting_price: product.starting_price,
            buy_now_price: product.buy_now_price,
            start_time: product.start_time ? new Date(product.start_time) : null,
            end_time: product.end_time ? new Date(product.end_time) : null,
            bid_count: product.bid_count,
            view_count: 0,
          }}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}

// 유틸리티 컴포넌트
function InfoItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <span className="text-sm text-gray-500">{label}</span>
      <p className={`mt-1 font-medium ${highlight ? 'text-purple-400 text-lg' : 'text-white'}`}>{value}</p>
    </div>
  );
}

function SlotStatCard({ label, value, color }: { label: string; value: number; color: 'purple' | 'emerald' | 'amber' | 'cyan' }) {
  const colors = {
    purple: 'from-purple-500/10 to-purple-500/5 border-purple-500/20',
    emerald: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20',
    amber: 'from-amber-500/10 to-amber-500/5 border-amber-500/20',
    cyan: 'from-cyan-500/10 to-cyan-500/5 border-cyan-500/20',
  };

  return (
    <div className={`rounded-2xl bg-gradient-to-br ${colors[color]} border p-5`}>
      <span className="text-sm text-gray-400">{label}</span>
      <div className="text-2xl font-bold text-white mt-1">{value}</div>
    </div>
  );
}

function ArrowLeftIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}
