'use client';

/**
 * TipTap Editor Adapter
 *
 * 기존 TipTapEditor를 EditorProps 인터페이스에 맞게 래핑
 */

import type { EditorProps } from '@auction/shared';
import { TipTapEditor } from '../components/TipTapEditor';

export function TipTapAdapter({
  value,
  onChange,
  placeholder,
  readOnly = false,
  onImageUpload,
  disabled = false,
}: EditorProps) {
  return (
    <TipTapEditor
      content={value}
      onChange={onChange}
      placeholder={placeholder}
      editable={!readOnly && !disabled}
      onImageUpload={onImageUpload}
    />
  );
}
