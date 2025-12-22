'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Input, Select, Toggle } from '@/components/ui';
import { bannersApi, BannerCreate } from '@/lib/api';

const positionOptions = [
  { value: 'main_top', label: '메인 상단' },
  { value: 'main_middle', label: '메인 중간' },
  { value: 'sidebar', label: '사이드바' },
  { value: 'popup', label: '팝업' },
  { value: 'footer', label: '푸터' },
];

const typeOptions = [
  { value: 'image', label: '이미지' },
  { value: 'video', label: '비디오' },
  { value: 'html', label: 'HTML' },
];

export default function NewBannerPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<BannerCreate>({
    title: '',
    description: '',
    position: 'main_top',
    type: 'image',
    image_url: '',
    mobile_image_url: '',
    alt_text: '',
    link_url: '',
    link_target: '_blank',
    is_active: true,
    sort_order: 0,
    html_content: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      alert('제목을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await bannersApi.create(formData);
      router.push('/banners');
    } catch (error) {
      console.error('Failed to create banner:', error);
      alert('배너 생성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">배너 등록</h1>
          <p className="text-gray-400">새로운 배너를 등록합니다.</p>
        </div>
        <Button variant="ghost" onClick={() => router.back()}>
          취소
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* 기본 정보 */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">기본 정보</h2>
            <div className="space-y-4">
              <Input
                label="제목"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="배너 제목을 입력하세요"
                required
              />
              <Input
                label="설명"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="배너 설명 (선택)"
              />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="위치"
                  value={formData.position || 'main_top'}
                  onChange={(value) => setFormData({ ...formData, position: value as BannerCreate['position'] })}
                  options={positionOptions}
                />
                <Select
                  label="타입"
                  value={formData.type || 'image'}
                  onChange={(value) => setFormData({ ...formData, type: value as BannerCreate['type'] })}
                  options={typeOptions}
                />
              </div>
              <Input
                label="정렬 순서"
                type="number"
                value={formData.sort_order || 0}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
              />
              <div className="flex items-center gap-3">
                <Toggle
                  checked={formData.is_active || false}
                  onChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <span className="text-white">활성화</span>
              </div>
            </div>
          </Card>

          {/* 미디어 설정 */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">미디어 설정</h2>
            <div className="space-y-4">
              <Input
                label="PC 이미지 URL"
                value={formData.image_url || ''}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/banner.jpg"
              />
              <Input
                label="모바일 이미지 URL"
                value={formData.mobile_image_url || ''}
                onChange={(e) => setFormData({ ...formData, mobile_image_url: e.target.value })}
                placeholder="https://example.com/banner-mobile.jpg"
              />
              <Input
                label="이미지 대체 텍스트 (Alt)"
                value={formData.alt_text || ''}
                onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
                placeholder="이미지 설명 (접근성용)"
              />
              {formData.type === 'html' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    HTML 콘텐츠
                  </label>
                  <textarea
                    className="w-full h-40 bg-gray-800 border border-gray-700 rounded-lg p-3 text-white resize-none focus:outline-none focus:border-purple-500"
                    value={formData.html_content || ''}
                    onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
                    placeholder="<div>...</div>"
                  />
                </div>
              )}
            </div>
          </Card>

          {/* 링크 설정 */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">링크 설정</h2>
            <div className="space-y-4">
              <Input
                label="링크 URL"
                value={formData.link_url || ''}
                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                placeholder="https://example.com/event"
              />
              <Select
                label="링크 타겟"
                value={formData.link_target || '_blank'}
                onChange={(value) => setFormData({ ...formData, link_target: value })}
                options={[
                  { value: '_blank', label: '새 창에서 열기' },
                  { value: '_self', label: '현재 창에서 열기' },
                ]}
              />
            </div>
          </Card>

          {/* 기간 설정 */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">노출 기간</h2>
            <div className="space-y-4">
              <Input
                label="시작일"
                type="datetime-local"
                value={formData.start_date || ''}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
              <Input
                label="종료일"
                type="datetime-local"
                value={formData.end_date || ''}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
              <p className="text-sm text-gray-500">
                시작일/종료일을 입력하지 않으면 무기한으로 노출됩니다.
              </p>
            </div>
          </Card>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" type="button" onClick={() => router.back()}>
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '저장 중...' : '배너 등록'}
          </Button>
        </div>
      </form>
    </div>
  );
}
