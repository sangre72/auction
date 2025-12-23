'use client';

import { useState, useCallback, useRef } from 'react';
import { formatFileSize } from '@auction/shared';
import type { UploadedFile } from '../types';

interface FileUploadProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  onUpload: (file: File) => Promise<{ id: string; url: string }>;
  onRemove?: (fileId: string) => Promise<void>;
  maxFiles?: number;
  maxSize?: number; // bytes
  accept?: string;
  disabled?: boolean;
}

export function FileUpload({
  files,
  onFilesChange,
  onUpload,
  onRemove,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  accept = '*/*',
  disabled = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (mimeType: string): React.ReactNode => {
    if (mimeType.startsWith('image/')) return <ImageFileIcon />;
    if (mimeType.startsWith('video/')) return <VideoFileIcon />;
    if (mimeType.startsWith('audio/')) return <AudioFileIcon />;
    if (mimeType.includes('pdf')) return <PdfFileIcon />;
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel'))
      return <SpreadsheetFileIcon />;
    if (mimeType.includes('document') || mimeType.includes('word'))
      return <DocumentFileIcon />;
    if (mimeType.includes('zip') || mimeType.includes('compressed'))
      return <ArchiveFileIcon />;
    return <DefaultFileIcon />;
  };

  const processFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const newFiles: File[] = Array.from(fileList);

      // 파일 수 제한 확인
      if (files.length + newFiles.length > maxFiles) {
        alert(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`);
        return;
      }

      for (const file of newFiles) {
        // 파일 크기 확인
        if (file.size > maxSize) {
          alert(`${file.name}: 파일 크기가 ${formatFileSize(maxSize)}를 초과합니다.`);
          continue;
        }

        // 임시 ID 생성
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`;

        // 업로드 중 상태로 추가
        const uploadingFile: UploadedFile = {
          id: tempId,
          file,
          progress: 0,
          status: 'uploading',
        };

        onFilesChange([...files, uploadingFile]);

        try {
          // 업로드 실행
          const result = await onUpload(file);

          // 성공 시 상태 업데이트
          onFilesChange(
            files.map((f) =>
              f.id === tempId
                ? { ...f, id: result.id, status: 'completed' as const, url: result.url, progress: 100 }
                : f
            ).concat(
              files.find((f) => f.id === tempId)
                ? []
                : [{
                    id: result.id,
                    file,
                    progress: 100,
                    status: 'completed' as const,
                    url: result.url,
                  }]
            )
          );
        } catch (error) {
          console.error('File upload failed:', error);
          // 실패 시 상태 업데이트
          onFilesChange(
            files.map((f) =>
              f.id === tempId
                ? { ...f, status: 'error' as const, error: '업로드 실패' }
                : f
            )
          );
        }
      }
    },
    [files, maxFiles, maxSize, onFilesChange, onUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      processFiles(e.dataTransfer.files);
    },
    [disabled, processFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        processFiles(e.target.files);
      }
      // 같은 파일 재선택 허용
      e.target.value = '';
    },
    [processFiles]
  );

  const handleRemove = useCallback(
    async (fileId: string) => {
      try {
        if (onRemove) {
          await onRemove(fileId);
        }
        onFilesChange(files.filter((f) => f.id !== fileId));
      } catch (error) {
        console.error('File remove failed:', error);
      }
    },
    [files, onFilesChange, onRemove]
  );

  return (
    <div className="space-y-4">
      {/* 드래그 앤 드롭 영역 */}
      <div
        onClick={() => !disabled && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors bg-gray-50
          ${isDragging ? 'border-purple-500 bg-purple-100' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        <div className="flex flex-col items-center gap-2">
          <UploadIcon className="w-10 h-10 text-gray-400" />
          <div>
            <span className="text-gray-600">파일을 드래그하거나 </span>
            <span className="text-purple-600 hover:text-purple-700 font-medium">클릭하여 선택</span>
          </div>
          <p className="text-sm text-gray-500">
            최대 {maxFiles}개, 각 파일 {formatFileSize(maxSize)} 이하
          </p>
        </div>
      </div>

      {/* 파일 목록 */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((uploadedFile) => (
            <div
              key={uploadedFile.id}
              className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
            >
              {/* 파일 아이콘 */}
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gray-100 rounded">
                {getFileIcon(uploadedFile.file.type)}
              </div>

              {/* 파일 정보 */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">{uploadedFile.file.name}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {formatFileSize(uploadedFile.file.size)}
                  </span>
                  {uploadedFile.status === 'uploading' && (
                    <span className="text-xs text-purple-600">업로드 중...</span>
                  )}
                  {uploadedFile.status === 'error' && (
                    <span className="text-xs text-red-500">{uploadedFile.error}</span>
                  )}
                  {uploadedFile.status === 'completed' && (
                    <span className="text-xs text-emerald-600">완료</span>
                  )}
                </div>

                {/* 진행률 표시 */}
                {uploadedFile.status === 'uploading' && (
                  <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 transition-all duration-300"
                      style={{ width: `${uploadedFile.progress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* 삭제 버튼 */}
              <button
                type="button"
                onClick={() => handleRemove(uploadedFile.id)}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                title="삭제"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 아이콘 컴포넌트들
function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
      />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function ImageFileIcon() {
  return (
    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

function VideoFileIcon() {
  return (
    <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  );
}

function AudioFileIcon() {
  return (
    <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
      />
    </svg>
  );
}

function PdfFileIcon() {
  return (
    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    </svg>
  );
}

function SpreadsheetFileIcon() {
  return (
    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  );
}

function DocumentFileIcon() {
  return (
    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function ArchiveFileIcon() {
  return (
    <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
      />
    </svg>
  );
}

function DefaultFileIcon() {
  return (
    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    </svg>
  );
}
