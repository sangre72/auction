'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Card, Input, Select, Toggle } from '@/components/ui';
import { bannersApi, Banner, BannerUpdate } from '@/lib/api';

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

export default function EditBannerPage() {
  const router = useRouter();
  const params = useParams();
  const bannerId = Number(params.id);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState<BannerUpdate>({});

  const fetchBanner = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await bannersApi.getById(bannerId);
      setBanner(response.data);
      setFormData({
        title: response.data.title,
        description: response.data.description,
        position: response.data.position,
        type: response.data.type,
        image_url: response.data.image_url,
        mobile_image_url: response.data.mobile_image_url,
        alt_text: response.data.alt_text,
        link_url: response.data.link_url,
        link_target: response.data.link_target,
        is_active: response.data.is_active,
        sort_order: response.data.sort_order,
        html_content: response.data.html_content,
        start_date: response.data.start_date ? response.data.start_date.slice(0, 16) : undefined,
        end_date: response.data.end_date ? response.data.end_date.slice(0, 16) : undefined,
      });
    } catch (error) {
      console.error('Failed to fetch banner:', error);
      alert('배너를 불러오는데 실패했습니다.');
      router.push('/banners');
    } finally {
      setIsLoading(false);
    }
  }, [bannerId, router]);

  useEffect(() => {
    fetchBanner();
  }, [fetchBanner]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      alert('제목을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      await bannersApi.update(bannerId, formData);
      router.push('/banners');
    } catch (error) {
      console.error('Failed to update banner:', error);
      alert('배너 수정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-500 border-t-transparent" />
      </div>
    );
  }

  if (!banner) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">배너 수정</h1>
          <p className="text-gray-400">배너 정보를 수정합니다.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => router.back()}>
            취소
          </Button>
        </div>
      </div>

      {/* 통계 정보 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="text-sm text-gray-400">조회수</div>
          <div className="text-2xl font-bold text-white">{banner.view_count.toLocaleString()}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-400">클릭수</div>
          <div className="text-2xl font-bold text-cyan-400">{banner.click_count.toLocaleString()}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-400">CTR</div>
          <div className="text-2xl font-bold text-emerald-400">
            {banner.view_count > 0 ? ((banner.click_count / banner.view_count) * 100).toFixed(2) : '0.00'}%
          </div>
        </Card>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* 기본 정보 */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">기본 정보</h2>
            <div className="space-y-4">
              <Input
                label="제목"
                value={formData.title || ''}
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
                  onChange={(value) => setFormData({ ...formData, position: value as BannerUpdate['position'] })}
                  options={positionOptions}
                />
                <Select
                  label="타입"
                  value={formData.type || 'image'}
                  onChange={(value) => setFormData({ ...formData, type: value as BannerUpdate['type'] })}
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
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value || undefined })}
              />
              <Input
                label="종료일"
                type="datetime-local"
                value={formData.end_date || ''}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value || undefined })}
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
            {isSubmitting ? '저장 중...' : '저장'}
          </Button>
        </div>
      </form>
    </div>
  );
}
