// 게시판 모듈 타입 정의
// 공유 타입은 @auction/shared에서 import

import type {
  Board as SharedBoard,
  Post as SharedPost,
  PostStatus as SharedPostStatus,
  PostAttachment,
} from '@auction/shared';

// 공유 타입 re-export
export type Board = SharedBoard;
export type Post = SharedPost;
export type PostStatus = SharedPostStatus;
export type Attachment = PostAttachment;

// 모듈 전용 타입 - 폼 관련
export interface PostFormData {
  title: string;
  content: string;
  is_pinned: boolean;
  is_notice: boolean;
  status?: PostStatus;
  attachments?: File[];
}

export interface PostFormErrors {
  title?: string;
  content?: string;
}

// 모듈 전용 타입 - 파일 업로드 상태
export interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

// 모듈 전용 타입 - 에디터 관련
export interface EditorMenuAction {
  name: string;
  icon: React.ReactNode;
  action: () => void;
  isActive?: boolean;
  disabled?: boolean;
}

export interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  onImageUpload?: (file: File) => Promise<string>;
}
