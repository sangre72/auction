// 게시판 모듈 API 함수

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface ApiResponse<T> {
  data: T;
  status: number;
}

interface UploadResponse {
  id: number;
  url: string;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    credentials: 'include', // httpOnly 쿠키 자동 전송
    headers: {
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw { ...error, status: response.status };
  }

  const data = await response.json();
  return { data, status: response.status };
}

/**
 * 에디터 내 이미지 업로드
 */
export async function uploadImage(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/uploads/images`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw { ...error, status: response.status };
  }

  return response.json();
}

/**
 * 첨부파일 업로드
 */
export async function uploadAttachment(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/uploads/attachments`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw { ...error, status: response.status };
  }

  return response.json();
}

/**
 * 첨부파일 삭제
 */
export async function deleteAttachment(attachmentId: string): Promise<void> {
  await apiRequest(`/uploads/attachments/${attachmentId}`, {
    method: 'DELETE',
  });
}

/**
 * 게시글에 첨부파일 연결
 */
export async function linkAttachmentsToPost(
  postId: number,
  attachmentIds: string[]
): Promise<void> {
  await apiRequest(`/posts/${postId}/attachments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ attachment_ids: attachmentIds.map(Number) }),
  });
}
