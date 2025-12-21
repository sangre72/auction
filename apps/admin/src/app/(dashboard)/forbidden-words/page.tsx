'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button, SearchInput, Badge, DataGrid, Alert, Tabs, Card, Modal, Input, Select, Textarea } from '@/components/ui';
import { formatDate } from '@auction/shared';
import type { ForbiddenWordType, ForbiddenWordTarget } from '@auction/shared';
import {
  forbiddenWordsApi,
  type ForbiddenWord,
  type ForbiddenWordCreate,
  type ForbiddenWordUpdate,
} from '@/lib/api';

// API 응답 타입 (백엔드와 일치)
interface ForbiddenWordsResponse {
  data: ForbiddenWord[];
  meta: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

const statusTabs = [
  { id: 'all', label: '전체' },
  { id: 'active', label: '활성화' },
  { id: 'inactive', label: '비활성화' },
];

const targetOptions = [
  { value: 'all', label: '전체' },
  { value: 'post_title', label: '게시글 제목' },
  { value: 'post_content', label: '게시글 내용' },
  { value: 'comment', label: '댓글' },
  { value: 'nickname', label: '닉네임' },
];

const matchTypeOptions = [
  { value: 'contains', label: '포함' },
  { value: 'exact', label: '정확히 일치' },
  { value: 'regex', label: '정규식' },
];

const targetLabel: Record<string, string> = {
  all: '전체',
  post_title: '게시글 제목',
  post_content: '게시글 내용',
  comment: '댓글',
  nickname: '닉네임',
};

const matchTypeLabel: Record<string, string> = {
  contains: '포함',
  exact: '정확히 일치',
  regex: '정규식',
};

export default function ForbiddenWordsPage() {
  const [words, setWords] = useState<ForbiddenWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchValue, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<ForbiddenWord | null>(null);
  const [formData, setFormData] = useState<ForbiddenWordCreate>({
    word: '',
    replacement: '',
    match_type: 'contains',
    target: 'all',
    is_active: true,
    reason: '',
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const is_active = activeTab === 'all' ? undefined : activeTab === 'active';
      const res = await forbiddenWordsApi.getList({
        page,
        page_size: 20,
        search: searchValue || undefined,
        is_active,
      }) as unknown as ForbiddenWordsResponse;

      setWords(res.data);
      setTotalPages(res.meta.total_pages);
      setTotalCount(res.meta.total);
    } catch (err) {
      console.error('Failed to fetch forbidden words:', err);
      setError('금칙어 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, searchValue]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setPage(1);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setPage(1);
  };

  const openCreateModal = () => {
    setEditingWord(null);
    setFormData({
      word: '',
      replacement: '',
      match_type: 'contains',
      target: 'all',
      is_active: true,
      reason: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (word: ForbiddenWord) => {
    setEditingWord(word);
    setFormData({
      word: word.word,
      replacement: word.replacement || '',
      match_type: word.match_type,
      target: word.target,
      is_active: word.is_active,
      reason: word.reason || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingWord(null);
  };

  const handleSubmit = async () => {
    if (!formData.word.trim()) {
      setError('금칙어를 입력해주세요.');
      return;
    }

    try {
      if (editingWord) {
        const updateData: ForbiddenWordUpdate = {
          word: formData.word,
          replacement: formData.replacement || undefined,
          match_type: formData.match_type,
          target: formData.target,
          is_active: formData.is_active,
          reason: formData.reason || undefined,
        };
        await forbiddenWordsApi.update(editingWord.id, updateData);
      } else {
        await forbiddenWordsApi.create(formData);
      }
      closeModal();
      fetchData();
    } catch (err) {
      console.error('Failed to save forbidden word:', err);
      setError(editingWord ? '금칙어 수정에 실패했습니다.' : '금칙어 등록에 실패했습니다.');
    }
  };

  const handleToggleActive = async (word: ForbiddenWord) => {
    try {
      await forbiddenWordsApi.update(word.id, { is_active: !word.is_active });
      fetchData();
    } catch (err) {
      console.error('Failed to update forbidden word:', err);
      setError('금칙어 상태 변경에 실패했습니다.');
    }
  };

  const handleDelete = async (word: ForbiddenWord) => {
    if (!confirm(`'${word.word}' 금칙어를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await forbiddenWordsApi.delete(word.id);
      fetchData();
    } catch (err) {
      console.error('Failed to delete forbidden word:', err);
      setError('금칙어 삭제에 실패했습니다.');
    }
  };

  const columns = [
    {
      key: 'word',
      header: '금칙어',
      render: (word: ForbiddenWord) => (
        <span className="font-medium text-red-600">{word.word}</span>
      ),
    },
    {
      key: 'replacement',
      header: '대체어',
      render: (word: ForbiddenWord) => (
        <span className="text-gray-600">{word.replacement || '***'}</span>
      ),
    },
    {
      key: 'match_type',
      header: '매칭 방식',
      render: (word: ForbiddenWord) => (
        <Badge variant="default">{matchTypeLabel[word.match_type] || word.match_type}</Badge>
      ),
    },
    {
      key: 'target',
      header: '적용 대상',
      render: (word: ForbiddenWord) => (
        <Badge variant="info">{targetLabel[word.target] || word.target}</Badge>
      ),
    },
    {
      key: 'is_active',
      header: '상태',
      render: (word: ForbiddenWord) => (
        <Badge variant={word.is_active ? 'success' : 'default'}>
          {word.is_active ? '활성화' : '비활성화'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      header: '등록일',
      render: (word: ForbiddenWord) => (
        <span className="text-gray-500 text-sm">{formatDate(word.created_at)}</span>
      ),
    },
    {
      key: 'actions',
      header: '관리',
      render: (word: ForbiddenWord) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              openEditModal(word);
            }}
          >
            수정
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleActive(word);
            }}
          >
            {word.is_active ? '비활성화' : '활성화'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(word);
            }}
          >
            삭제
          </Button>
        </div>
      ),
    },
  ];

  // 통계 계산
  const activeCount = words.filter(w => w.is_active).length;
  const inactiveCount = words.filter(w => !w.is_active).length;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">금칙어 관리</h1>
          <p className="text-gray-600 mt-1">게시판, 댓글, 닉네임 등에서 사용을 금지할 단어를 관리합니다.</p>
        </div>
        <Button onClick={openCreateModal}>
          금칙어 추가
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="text-sm text-red-600">전체 금칙어</div>
          <div className="text-2xl font-bold text-red-700">{totalCount}</div>
        </Card>
        <Card className="p-4 bg-emerald-50 border-emerald-200">
          <div className="text-sm text-emerald-600">활성화</div>
          <div className="text-2xl font-bold text-emerald-700">{activeCount}</div>
        </Card>
        <Card className="p-4 bg-gray-50 border-gray-200">
          <div className="text-sm text-gray-600">비활성화</div>
          <div className="text-2xl font-bold text-gray-700">{inactiveCount}</div>
        </Card>
      </div>

      {/* 필터 */}
      <div className="flex items-center justify-between">
        <Tabs tabs={statusTabs} activeTab={activeTab} onChange={handleTabChange} />
        <SearchInput
          value={searchValue}
          onSearch={handleSearch}
          placeholder="금칙어 검색..."
        />
      </div>

      {/* 에러 */}
      {error && (
        <Alert variant="danger" title="오류" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 데이터 그리드 */}
      <DataGrid
        data={words}
        columns={columns}
        isLoading={loading}
        onRowClick={openEditModal}
      />

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            이전
          </Button>
          <span className="text-sm text-gray-600">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            다음
          </Button>
        </div>
      )}

      {/* 모달 */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingWord ? '금칙어 수정' : '금칙어 추가'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              금칙어 *
            </label>
            <Input
              value={formData.word}
              onChange={(e) => setFormData({ ...formData, word: e.target.value })}
              placeholder="금지할 단어 입력"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              대체어 (비워두면 *** 로 표시)
            </label>
            <Input
              value={formData.replacement || ''}
              onChange={(e) => setFormData({ ...formData, replacement: e.target.value })}
              placeholder="대체할 텍스트"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                매칭 방식
              </label>
              <Select
                value={formData.match_type}
                onChange={(value) => setFormData({ ...formData, match_type: value as ForbiddenWordType })}
                options={matchTypeOptions}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                적용 대상
              </label>
              <Select
                value={formData.target}
                onChange={(value) => setFormData({ ...formData, target: value as ForbiddenWordTarget })}
                options={targetOptions}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              등록 사유
            </label>
            <Textarea
              value={formData.reason || ''}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="금칙어 등록 사유 (선택)"
              rows={2}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="is_active" className="text-sm text-gray-700">
              활성화
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={closeModal}>
              취소
            </Button>
            <Button onClick={handleSubmit}>
              {editingWord ? '수정' : '등록'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
