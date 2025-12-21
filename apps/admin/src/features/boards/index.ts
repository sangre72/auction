// features/boards public API

// Components
export { TipTapEditor, FileUpload, PostForm } from './components';

// API
export { uploadImage, uploadAttachment, deleteAttachment, linkAttachmentsToPost } from './api';

// Types
export type {
  Board,
  Post,
  PostStatus,
  Attachment,
  PostFormData,
  PostFormErrors,
  UploadedFile,
  TipTapEditorProps,
} from './types';
