'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, Select } from '@/components/ui';
import { ImageUploader } from '@/components/forms/ImageUploader';
import { DateTimePicker } from '@/components/forms/DateTimePicker';
import { TipTapEditor } from '@/components/editor/TipTapEditor';
import { ProductPreview } from '@/components/products/ProductPreview';
import { productsApi, categoriesApi, CategoryListItem } from '@/lib/api';

// 경매 타입
const AUCTION_TYPES = [
  { value: 'slot', label: '슬롯 경매' },
  { value: 'auction', label: '일반 경매' },
];

interface FormData {
  title: string;
  category_id: number | null;
  auction_type: string;
  images: string[];
  description: string;
  // 슬롯 경매용
  slot_count: number;
  slot_price: number;
  // 일반 경매용
  starting_price: number;
  min_bid_increment: number;
  buy_now_price: number | null;
  // 공통
  start_time: Date | null;
  end_time: Date | null;
}

interface FormErrors {
  title?: string;
  category_id?: string;
  images?: string;
  description?: string;
  slot_count?: string;
  slot_price?: string;
  starting_price?: string;
  start_time?: string;
  end_time?: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    category_id: null,
    auction_type: 'slot',
    images: [],
    description: '',
    slot_count: 100,
    slot_price: 10000,
    starting_price: 100000,
    min_bid_increment: 10000,
    buy_now_price: null,
    start_time: null,
    end_time: null,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // 카테고리 목록 로드
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesApi.getList({ is_active: true });
        setCategories(response.data);
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const isSlotAuction = formData.auction_type === 'slot';

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // 제목 검증
    if (!formData.title.trim()) {
      newErrors.title = '상품명을 입력해주세요.';
    } else if (formData.title.length < 2 || formData.title.length > 100) {
      newErrors.title = '상품명은 2~100자여야 합니다.';
    }

    // 카테고리 검증
    if (!formData.category_id) {
      newErrors.category_id = '카테고리를 선택해주세요.';
    }

    // 이미지 검증
    if (formData.images.length === 0) {
      newErrors.images = '최소 1장의 이미지를 업로드해주세요.';
    }

    // 설명 검증
    if (!formData.description.trim() || formData.description === '<p></p>') {
      newErrors.description = '상품 설명을 입력해주세요.';
    }

    // 경매 타입별 검증
    if (isSlotAuction) {
      if (formData.slot_count < 1) {
        newErrors.slot_count = '슬롯 수는 1 이상이어야 합니다.';
      }
      if (formData.slot_price < 1000) {
        newErrors.slot_price = '슬롯당 가격은 1,000원 이상이어야 합니다.';
      }
    } else {
      if (formData.starting_price < 1000) {
        newErrors.starting_price = '시작가는 1,000원 이상이어야 합니다.';
      }
    }

    // 시작일 검증
    if (!formData.start_time) {
      newErrors.start_time = '경매 시작일을 선택해주세요.';
    }

    // 종료일 검증
    if (!formData.end_time) {
      newErrors.end_time = '경매 종료일을 선택해주세요.';
    } else if (formData.start_time && formData.end_time <= formData.start_time) {
      newErrors.end_time = '종료일은 시작일 이후여야 합니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // API로 상품 생성
      const productData = {
        seller_id: 1, // TODO: 현재 로그인한 관리자 ID 또는 선택한 판매자 ID
        title: formData.title,
        description: formData.description,
        category_id: formData.category_id || undefined,
        auction_type: formData.auction_type,
        starting_price: isSlotAuction ? formData.slot_price * formData.slot_count : formData.starting_price,
        buy_now_price: formData.buy_now_price || undefined,
        min_bid_increment: formData.min_bid_increment,
        slot_price: isSlotAuction ? formData.slot_price : undefined,
        slot_count: isSlotAuction ? formData.slot_count : 1,
        start_time: formData.start_time?.toISOString(),
        end_time: formData.end_time?.toISOString(),
        thumbnail_url: formData.images[0] || undefined,
      };

      await productsApi.create(productData);
      router.push('/products');
    } catch (error) {
      console.error('Submit error:', error);
      const errorMessage = (error as { detail?: string })?.detail || '상품 등록에 실패했습니다.';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">상품 등록</h1>
          <p className="text-gray-400">새로운 경매 상품을 등록합니다.</p>
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
          <Button variant="ghost" onClick={() => router.back()}>
            취소
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <Card className="p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">기본 정보</h2>

          <div className="grid gap-6 md:grid-cols-2">
            <Input
              label="상품명"
              required
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="상품명을 입력하세요"
              error={errors.title}
            />

            <Select
              label="카테고리"
              required
              options={categories.map(cat => ({ value: String(cat.id), label: cat.name }))}
              value={formData.category_id ? String(formData.category_id) : ''}
              onChange={(value) => updateField('category_id', value ? Number(value) : null)}
              placeholder={loadingCategories ? '로딩 중...' : '카테고리 선택'}
              error={errors.category_id}
              disabled={loadingCategories}
            />
          </div>

          <Select
            label="경매 타입"
            required
            options={AUCTION_TYPES}
            value={formData.auction_type}
            onChange={(value) => updateField('auction_type', value)}
          />
        </Card>

        {/* 이미지 */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">상품 이미지</h2>
          <ImageUploader
            images={formData.images}
            onChange={(images) => updateField('images', images)}
            maxImages={10}
            label="홍보 이미지"
            required
            error={errors.images}
          />
        </Card>

        {/* 상품 설명 */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">상품 설명</h2>
          <TipTapEditor
            content={formData.description}
            onChange={(content) => updateField('description', content)}
            label="상세 설명"
            required
            error={errors.description}
            placeholder="상품에 대한 상세 설명을 입력하세요. 이미지와 YouTube 영상도 첨부할 수 있습니다."
          />
        </Card>

        {/* 경매 설정 */}
        <Card className="p-6 space-y-6">
          <h2 className="text-lg font-semibold text-white">경매 설정</h2>

          {isSlotAuction ? (
            // 슬롯 경매 설정
            <div className="grid gap-6 md:grid-cols-2">
              <Input
                type="number"
                label="슬롯 수"
                required
                value={formData.slot_count.toString()}
                onChange={(e) => updateField('slot_count', parseInt(e.target.value) || 0)}
                min={1}
                error={errors.slot_count}
                helperText="총 참여 가능한 슬롯 수"
              />

              <Input
                type="number"
                label="슬롯당 가격"
                required
                value={formData.slot_price.toString()}
                onChange={(e) => updateField('slot_price', parseInt(e.target.value) || 0)}
                min={1000}
                step={1000}
                error={errors.slot_price}
                helperText="원 단위 (최소 1,000원)"
              />
            </div>
          ) : (
            // 일반 경매 설정
            <div className="grid gap-6 md:grid-cols-2">
              <Input
                type="number"
                label="시작가"
                required
                value={formData.starting_price.toString()}
                onChange={(e) => updateField('starting_price', parseInt(e.target.value) || 0)}
                min={1000}
                step={1000}
                error={errors.starting_price}
                helperText="원 단위 (최소 1,000원)"
              />

              <Input
                type="number"
                label="최소 입찰 단위"
                value={formData.min_bid_increment.toString()}
                onChange={(e) => updateField('min_bid_increment', parseInt(e.target.value) || 0)}
                min={1000}
                step={1000}
                helperText="원 단위"
              />
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <DateTimePicker
              label="경매 시작일"
              required
              value={formData.start_time}
              onChange={(date) => updateField('start_time', date)}
              minDate={new Date()}
              error={errors.start_time}
            />

            <DateTimePicker
              label="경매 종료일"
              required
              value={formData.end_time}
              onChange={(date) => updateField('end_time', date)}
              minDate={formData.start_time || new Date()}
              error={errors.end_time}
            />
          </div>

          <Input
            type="number"
            label="즉시 구매가 (선택)"
            value={formData.buy_now_price?.toString() || ''}
            onChange={(e) =>
              updateField('buy_now_price', e.target.value ? parseInt(e.target.value) : null)
            }
            min={0}
            step={10000}
            helperText="입력하지 않으면 즉시 구매가 비활성화됩니다."
          />

          {/* 가격 요약 */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-white/10">
            {isSlotAuction ? (
              <>
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-gray-400">총 슬롯 가치</span>
                  <span className="text-white font-medium">
                    {(formData.slot_count * formData.slot_price).toLocaleString()}원
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-gray-400">슬롯당 가격</span>
                  <span className="text-purple-400 font-medium">
                    {formData.slot_price.toLocaleString()}원
                  </span>
                </div>
              </>
            ) : (
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-gray-400">시작가</span>
                <span className="text-emerald-400 font-medium">
                  {formData.starting_price.toLocaleString()}원
                </span>
              </div>
            )}
            {formData.buy_now_price && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">즉시 구매가</span>
                <span className="text-amber-400 font-medium">
                  {formData.buy_now_price.toLocaleString()}원
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* 제출 버튼 */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
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
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '등록 중...' : '상품 등록'}
          </Button>
        </div>
      </form>

      {/* 미리보기 모달 */}
      {showPreview && (
        <ProductPreview
          data={{
            title: formData.title,
            description: formData.description,
            category_id: formData.category_id,
            category_name: categories.find(c => c.id === formData.category_id)?.name,
            auction_type: formData.auction_type,
            images: formData.images,
            slot_count: formData.slot_count,
            slot_price: formData.slot_price,
            starting_price: formData.starting_price,
            buy_now_price: formData.buy_now_price,
            start_time: formData.start_time,
            end_time: formData.end_time,
          }}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
