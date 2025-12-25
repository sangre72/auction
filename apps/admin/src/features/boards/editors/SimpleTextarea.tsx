'use client';

/**
 * Simple Textarea Editor
 *
 * 의존성 없는 기본 에디터
 * 다른 프로젝트로 복사 시 TipTap 등의 의존성 없이 바로 사용 가능
 */

import type { EditorProps } from '@auction/shared';

export function SimpleTextarea({
  value,
  onChange,
  placeholder = '내용을 입력하세요...',
  readOnly = false,
  minHeight = 300,
  error = false,
  disabled = false,
}: EditorProps) {
  return (
    <div className={`border rounded-lg overflow-hidden ${error ? 'border-red-500' : 'border-gray-300'}`}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={disabled}
        className={`
          w-full px-4 py-3 text-gray-900 placeholder-gray-400
          bg-white resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
        `}
        style={{ minHeight: `${minHeight}px` }}
      />
    </div>
  );
}
