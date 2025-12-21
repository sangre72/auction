'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Input, Card, Alert } from '@/components/ui';
import { boardsApi, type Board, type BoardUpdate } from '@/lib/api';

const readPermissionOptions = [
  { value: 'public', label: '전체 공개' },
  { value: 'login', label: '로그인 필수' },
  { value: 'admin', label: '관리자만' },
];

const writePermissionOptions = [
  { value: 'login', label: '로그인 필수' },
  { value: 'admin', label: '관리자만' },
];

const commentPermissionOptions = [
  { value: 'login', label: '로그인 필수' },
  { value: 'disabled', label: '댓글 비허용' },
];

interface FormData {
  name: string;
  title: string;
  description: string;
  read_permission: string;
  write_permission: string;
  comment_permission: string;
  is_active: boolean;
  sort_order: number;
  allow_attachments: boolean;
  allow_images: boolean;
  max_attachments: number;
}

export default function EditBoardPage() {
  const router = useRouter();
  const params = useParams();
  const boardId = parseInt(params.id as string, 10);

  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    title: '',
    description: '',
    read_permission: 'public',
    write_permission: 'login',
    comment_permission: 'login',
    is_active: true,
    sort_order: 0,
    allow_attachments: true,
    allow_images: true,
    max_attachments: 5,
  });

  const fetchBoard = useCallback(async () => {
    try {
      setLoading(true);
      const res = await boardsApi.getById(boardId);
      const board = res.data;
      setBoard(board);
      setFormData({
        name: board.name,
        title: board.title,
        description: board.description || '',
        read_permission: board.read_permission,
        write_permission: board.write_permission,
        comment_permission: board.comment_permission,
        is_active: board.is_active,
        sort_order: board.sort_order,
        allow_attachments: board.allow_attachments,
        allow_images: board.allow_images,
        max_attachments: board.max_attachments,
      });
    } catch (err) {
      console.error('Failed to fetch board:', err);
      setError('게시판 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.title.trim()) {
      setError('게시판 영문명과 제목은 필수입니다.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const data: BoardUpdate = {
        name: formData.name,
        title: formData.title,
        description: formData.description || undefined,
        read_permission: formData.read_permission as 'public' | 'login' | 'admin',
        write_permission: formData.write_permission as 'login' | 'admin',
        comment_permission: formData.comment_permission as 'login' | 'disabled',
        is_active: formData.is_active,
        sort_order: formData.sort_order,
        allow_attachments: formData.allow_attachments,
        allow_images: formData.allow_images,
        max_attachments: formData.max_attachments,
      };

      await boardsApi.update(boardId, data);
      router.push('/boards');
    } catch (err: unknown) {
      console.error('Failed to update board:', err);
      const error = err as { detail?: string };
      setError(error?.detail || '게시판 수정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    );
  }

  if (!board) {
    return (
      <Alert variant="danger" title="오류">
        게시판을 찾을 수 없습니다.
      </Alert>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">게시판 편집</h1>
          <p className="text-gray-600 mt-1">{board.title} 게시판을 수정합니다.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/boards/${boardId}/posts`)}>
            게시글 관리
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            취소
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" title="오류" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">기본 정보</h2>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="게시판 영문명"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="notice"
              helperText="URL에 사용됩니다"
              required
            />
            <Input
              label="게시판 제목"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="공지사항"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="게시판 설명을 입력하세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="정렬 순서"
              type="number"
              value={formData.sort_order}
              onChange={(e) => updateField('sort_order', parseInt(e.target.value) || 0)}
            />
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => updateField('is_active', e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">활성화</span>
              </label>
            </div>
          </div>
        </Card>

        {/* 권한 설정 */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">권한 설정</h2>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                읽기 권한
              </label>
              <select
                value={formData.read_permission}
                onChange={(e) => updateField('read_permission', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                {readPermissionOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                쓰기 권한
              </label>
              <select
                value={formData.write_permission}
                onChange={(e) => updateField('write_permission', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                {writePermissionOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                댓글 권한
              </label>
              <select
                value={formData.comment_permission}
                onChange={(e) => updateField('comment_permission', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                {commentPermissionOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* 기능 설정 */}
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">기능 설정</h2>

          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allow_images}
                onChange={(e) => updateField('allow_images', e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">이미지 첨부 허용</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.allow_attachments}
                onChange={(e) => updateField('allow_attachments', e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">파일 첨부 허용</span>
            </label>

            {formData.allow_attachments && (
              <div className="ml-6">
                <Input
                  label="최대 첨부파일 수"
                  type="number"
                  value={formData.max_attachments}
                  onChange={(e) => updateField('max_attachments', parseInt(e.target.value) || 1)}
                  min={1}
                  max={10}
                />
              </div>
            )}
          </div>
        </Card>

        {/* 제출 버튼 */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => router.back()}>
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
