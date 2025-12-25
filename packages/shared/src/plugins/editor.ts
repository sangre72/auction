/**
 * Editor Plugin Interface
 *
 * 다양한 에디터(TipTap, Slate, Markdown 등)를 플러그인으로 주입할 수 있는 인터페이스
 * 프로젝트별로 원하는 에디터를 선택하여 사용 가능
 */

import type { ComponentType } from 'react';

// ============================================================================
// Editor Props Interface
// ============================================================================

/**
 * 에디터 컴포넌트가 받는 표준 Props
 */
export interface EditorProps {
  /** 현재 콘텐츠 (HTML 또는 Markdown) */
  value: string;
  /** 콘텐츠 변경 핸들러 */
  onChange: (value: string) => void;
  /** 플레이스홀더 텍스트 */
  placeholder?: string;
  /** 읽기 전용 모드 */
  readOnly?: boolean;
  /** 이미지 업로드 핸들러 (optional) */
  onImageUpload?: (file: File) => Promise<string>;
  /** 최소 높이 (px) */
  minHeight?: number;
  /** 에러 상태 */
  error?: boolean;
  /** 비활성화 상태 */
  disabled?: boolean;
}

// ============================================================================
// Editor Plugin Interface
// ============================================================================

/**
 * 에디터 플러그인 인터페이스
 */
export interface EditorPlugin {
  /** 플러그인 이름 (식별용) */
  name: string;
  /** 플러그인 표시 이름 */
  displayName: string;
  /** 에디터 컴포넌트 */
  component: ComponentType<EditorProps>;
  /** 플러그인 설명 */
  description?: string;
  /** 지원하는 기능 */
  features?: EditorFeature[];
}

/**
 * 에디터가 지원하는 기능
 */
export type EditorFeature =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'heading'
  | 'blockquote'
  | 'code'
  | 'codeBlock'
  | 'bulletList'
  | 'orderedList'
  | 'link'
  | 'image'
  | 'video'
  | 'table'
  | 'emoji'
  | 'mention'
  | 'markdown';

// ============================================================================
// Editor Plugin Registry
// ============================================================================

/**
 * 에디터 플러그인 레지스트리
 * 앱에서 사용 가능한 에디터 플러그인들을 등록
 */
export interface EditorPluginRegistry {
  /** 기본 에디터 */
  default: EditorPlugin;
  /** 추가 에디터들 */
  plugins: Record<string, EditorPlugin>;
}

/**
 * 에디터 플러그인 레지스트리 생성
 */
export function createEditorRegistry(
  defaultPlugin: EditorPlugin,
  additionalPlugins?: Record<string, EditorPlugin>
): EditorPluginRegistry {
  return {
    default: defaultPlugin,
    plugins: {
      [defaultPlugin.name]: defaultPlugin,
      ...additionalPlugins,
    },
  };
}

/**
 * 레지스트리에서 에디터 플러그인 가져오기
 */
export function getEditorPlugin(
  registry: EditorPluginRegistry,
  name?: string
): EditorPlugin {
  if (!name) return registry.default;
  return registry.plugins[name] || registry.default;
}
