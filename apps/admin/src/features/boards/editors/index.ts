/**
 * Editor Plugins Registry
 *
 * 게시판 모듈에서 사용 가능한 에디터 플러그인들
 *
 * @example
 * // 기본 에디터 사용
 * import { defaultEditor } from './editors';
 * <PostForm editor={defaultEditor} />
 *
 * // 특정 에디터 사용
 * import { editorPlugins } from './editors';
 * <PostForm editor={editorPlugins.simple} />
 */

import type { EditorPlugin, EditorPluginRegistry } from '@auction/shared';
import { createEditorRegistry } from '@auction/shared';
import { SimpleTextarea } from './SimpleTextarea';
import { TipTapAdapter } from './TipTapAdapter';

// ============================================================================
// Editor Plugins
// ============================================================================

/**
 * Simple Textarea Editor Plugin
 * 의존성 없는 기본 에디터
 */
export const simpleEditorPlugin: EditorPlugin = {
  name: 'simple',
  displayName: 'Simple Editor',
  component: SimpleTextarea,
  description: '기본 텍스트 입력 에디터 (의존성 없음)',
  features: [],
};

/**
 * TipTap Editor Plugin
 * 풍부한 기능의 WYSIWYG 에디터
 */
export const tipTapEditorPlugin: EditorPlugin = {
  name: 'tiptap',
  displayName: 'TipTap Editor',
  component: TipTapAdapter,
  description: 'WYSIWYG 에디터 (이미지, 링크, 포맷팅 지원)',
  features: [
    'bold',
    'italic',
    'underline',
    'strikethrough',
    'heading',
    'blockquote',
    'code',
    'codeBlock',
    'bulletList',
    'orderedList',
    'link',
    'image',
    'video',
  ],
};

// ============================================================================
// Editor Registry
// ============================================================================

/**
 * 에디터 플러그인 레지스트리
 * TipTap을 기본 에디터로 사용
 */
export const editorRegistry: EditorPluginRegistry = createEditorRegistry(
  tipTapEditorPlugin, // 기본 에디터
  {
    simple: simpleEditorPlugin,
  }
);

/**
 * 기본 에디터 플러그인
 */
export const defaultEditor = tipTapEditorPlugin;

/**
 * 에디터 플러그인 맵
 */
export const editorPlugins = {
  simple: simpleEditorPlugin,
  tiptap: tipTapEditorPlugin,
};

// Re-export components for direct use
export { SimpleTextarea } from './SimpleTextarea';
export { TipTapAdapter } from './TipTapAdapter';
