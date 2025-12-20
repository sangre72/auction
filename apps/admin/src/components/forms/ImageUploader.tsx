'use client';

import { useState, useRef, useCallback } from 'react';
import { cn } from '@auction/ui/lib/utils';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
  label?: string;
  error?: string;
  required?: boolean;
}

export function ImageUploader({
  images,
  onChange,
  maxImages = 10,
  maxSizeMB = 5,
  label,
  error,
  required,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return 'JPG, PNG, WEBP, GIF 파일만 업로드 가능합니다.';
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `파일 크기는 ${maxSizeMB}MB를 초과할 수 없습니다.`;
    }
    return null;
  };

  const uploadFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const remainingSlots = maxImages - images.length;

    if (fileArray.length > remainingSlots) {
      setUploadError(`최대 ${maxImages}장까지 업로드 가능합니다.`);
      return;
    }

    setUploading(true);
    setUploadError(null);

    const newImages: string[] = [];

    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        setUploadError(validationError);
        setUploading(false);
        return;
      }

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/products/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || '업로드 실패');
        }

        const data = await response.json();
        newImages.push(data.url);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : '업로드 중 오류가 발생했습니다.');
        setUploading(false);
        return;
      }
    }

    onChange([...images, ...newImages]);
    setUploading(false);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        uploadFiles(e.dataTransfer.files);
      }
    },
    [images, maxImages]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    const newImages = [...images];
    const [removed] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, removed);
    onChange(newImages);
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
          <span className="text-gray-500 ml-2">({images.length}/{maxImages})</span>
        </label>
      )}

      {/* 이미지 미리보기 그리드 */}
      {images.length > 0 && (
        <div className="grid grid-cols-5 gap-3">
          {images.map((src, index) => (
            <div
              key={src}
              className="relative aspect-square rounded-xl overflow-hidden bg-slate-700/50 group"
            >
              <img
                src={src}
                alt={`이미지 ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {/* 대표 이미지 배지 */}
              {index === 0 && (
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-purple-500 text-white text-xs font-medium rounded-lg">
                  대표
                </div>
              )}
              {/* 오버레이 버튼 */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => moveImage(index, index - 1)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    title="앞으로 이동"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                {index < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveImage(index, index + 1)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    title="뒤로 이동"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors"
                  title="삭제"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 업로드 영역 */}
      {images.length < maxImages && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
            isDragging
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-white/20 hover:border-purple-500/50 hover:bg-white/5',
            uploading && 'pointer-events-none opacity-50'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
              <p className="text-gray-400">업로드 중...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 bg-purple-500/20 rounded-xl">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-medium">
                  {isDragging ? '여기에 놓으세요' : '이미지를 드래그하거나 클릭하여 업로드'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  JPG, PNG, WEBP, GIF (최대 {maxSizeMB}MB)
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 에러 메시지 */}
      {(error || uploadError) && (
        <p className="text-sm text-red-400">{error || uploadError}</p>
      )}
    </div>
  );
}
