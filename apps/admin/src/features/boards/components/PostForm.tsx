'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Card, Alert } from '@/components/ui';
import { TipTapEditor } from './TipTapEditor';
import { FileUpload } from './FileUpload';
import type { PostFormData, PostFormErrors, UploadedFile, Board, Post } from '../types';
import { uploadImage, uploadAttachment, deleteAttachment } from '../api';

interface PostFormProps {
  board: Board;
  post?: Post; // 수정 모드일 때
  onSubmit: (data: PostFormData, attachmentIds: string[]) => Promise<void>;
  onCancel: () => void;
}

export function PostForm({ board, post, onSubmit, onCancel }: PostFormProps) {
  const router = useRouter();
  const isEditMode = !!post;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<PostFormErrors>({});

  const [formData, setFormData] = useState<PostFormData>({
    title: post?.title || '',
    content: post?.content || '',
    is_pinned: post?.is_pinned || false,
    is_notice: post?.is_notice || false,
    status: post?.status || 'published',
  });

  const [attachments, setAttachments] = useState<UploadedFile[]>([]);

  // 수정 모드: 기존 첨부파일 로드
  useEffect(() => {
    if (post?.attachments) {
      const existingFiles: UploadedFile[] = post.attachments.map((att) => ({
        id: att.id.toString(),
        file: new File([], att.original_filename, { type: att.file_type || 'application/octet-stream' }),
        progress: 100,
        status: 'completed',
        url: att.file_url,
      }));
      setAttachments(existingFiles);
    }
  }, [post]);

  const updateField = <K extends keyof PostFormData>(field: K, value: PostFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof PostFormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: PostFormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요.';
    } else if (formData.title.length > 300) {
      newErrors.title = '제목은 300자 이내로 입력해주세요.';
    }

    if (!formData.content.trim() || formData.content === '<p></p>') {
      newErrors.content = '내용을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const attachmentIds = attachments
        .filter((f) => f.status === 'completed' && f.id)
        .map((f) => f.id);

      await onSubmit(formData, attachmentIds);
    } catch (err: unknown) {
      console.error('Failed to submit post:', err);
      const error = err as { detail?: string | Array<{ msg: string }>; status?: number };
      if (error?.status === 401) {
        setError('로그인이 필요합니다. 다시 로그인해주세요.');
      } else if (error?.status === 403) {
        setError('게시글 작성 권한이 없습니다.');
      } else if (error?.status === 0) {
        setError('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
      } else if (Array.isArray(error?.detail)) {
        setError(error.detail.map((e) => e.msg).join(', '));
      } else {
        setError(error?.detail || '게시글 저장에 실패했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = useCallback(async (file: File): Promise<string> => {
    const result = await uploadImage(file);
    return result.url;
  }, []);

  const handleAttachmentUpload = useCallback(
    async (file: File): Promise<{ id: string; url: string }> => {
      const result = await uploadAttachment(file);
      return { id: result.id.toString(), url: result.url };
    },
    []
  );

  const handleAttachmentRemove = useCallback(async (fileId: string) => {
    // 임시 파일인 경우 (temp-로 시작)는 API 호출 안함
    if (!fileId.startsWith('temp-')) {
      await deleteAttachment(fileId);
    }
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="danger" title="오류" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 기본 정보 */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">게시글 내용</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="게시글 제목을 입력하세요"
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
          {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            내용 <span className="text-red-500">*</span>
          </label>
          <TipTapEditor
            content={formData.content}
            onChange={(content) => updateField('content', content)}
            placeholder="게시글 내용을 입력하세요..."
            onImageUpload={handleImageUpload}
          />
          {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content}</p>}
        </div>
      </div>

      {/* 첨부파일 */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">첨부파일</h2>
        <FileUpload
          files={attachments}
          onFilesChange={setAttachments}
          onUpload={handleAttachmentUpload}
          onRemove={handleAttachmentRemove}
          maxFiles={10}
          maxSize={50 * 1024 * 1024} // 50MB
        />
      </div>

      {/* 옵션 설정 */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">옵션 설정</h2>

        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_notice}
              onChange={(e) => updateField('is_notice', e.target.checked)}
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-gray-300"
            />
            <span className="text-sm text-gray-700">공지사항으로 등록</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_pinned}
              onChange={(e) => updateField('is_pinned', e.target.checked)}
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-gray-300"
            />
            <span className="text-sm text-gray-700">상단 고정</span>
          </label>
        </div>
      </div>

      {/* 제출 버튼 */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '저장 중...' : isEditMode ? '수정 완료' : '게시글 작성'}
        </Button>
      </div>
    </form>
  );
}
