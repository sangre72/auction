'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QueueListData } from '@/hooks/useProductQueue';

interface QueueListPanelProps {
  queueList: QueueListData | null;
  currentUserId: string;
}

export function QueueListPanel({ queueList, currentUserId }: QueueListPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  };

  const maskUserId = (userId: string) => {
    if (userId === currentUserId) return '나';
    if (userId.length <= 8) return userId.slice(0, 4) + '****';
    return userId.slice(0, 8) + '****';
  };

  // 빈 대기열
  if (!queueList || queueList.total_count === 0) {
    return (
      <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl p-4 border border-gray-100">
        <div className="flex items-center gap-2 text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm">현재 대기열이 비어있습니다</span>
        </div>
      </div>
    );
  }

  const previewViewers = queueList.viewers.slice(0, 5);
  const hasMore = queueList.total_count > 5;

  return (
    <motion.div
      layout
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm"
    >
      {/* 헤더 (항상 보임) - 클릭하면 펼치기/접기 */}
      <motion.button
        layout
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            {/* 실시간 표시 점 */}
            <motion.span
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white"
            />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-gray-900">실시간 대기열</h3>
            <p className="text-xs text-gray-500">
              {queueList.viewers[0]?.status === 'viewing' ? '1명 보는 중' : ''}
              {queueList.total_count > 1 && ` · ${queueList.total_count - 1}명 대기`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* 인원수 뱃지 */}
          <motion.div
            key={queueList.total_count}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold rounded-full shadow-lg shadow-purple-500/25"
          >
            {queueList.total_count}명
          </motion.div>

          {/* 펼치기/접기 아이콘 */}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </div>
      </motion.button>

      {/* 미리보기 (접힌 상태) */}
      <AnimatePresence>
        {!isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-4"
          >
            <div className="flex items-center gap-2">
              {/* 아바타 스택 */}
              <div className="flex -space-x-2">
                {previewViewers.map((viewer, index) => {
                  const isMe = viewer.user_id === currentUserId;
                  const isViewing = viewer.status === 'viewing';

                  return (
                    <motion.div
                      key={viewer.user_id}
                      initial={{ scale: 0, x: 20 }}
                      animate={{ scale: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`
                        relative w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white shadow-sm
                        ${isViewing
                          ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white z-10'
                          : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600'
                        }
                        ${isMe ? 'ring-2 ring-purple-400 ring-offset-1' : ''}
                      `}
                      style={{ zIndex: previewViewers.length - index }}
                    >
                      {isViewing ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      ) : (
                        viewer.position
                      )}
                      {isMe && (
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-purple-500 rounded-full text-[8px] text-white flex items-center justify-center border border-white">
                          나
                        </span>
                      )}
                    </motion.div>
                  );
                })}
                {hasMore && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.25 }}
                    className="w-9 h-9 rounded-full bg-gray-800 text-white text-xs font-bold flex items-center justify-center border-2 border-white"
                  >
                    +{queueList.total_count - 5}
                  </motion.div>
                )}
              </div>

              {/* 빠른 정보 */}
              <div className="flex-1 text-xs text-gray-500 ml-2">
                {previewViewers.some(v => v.user_id === currentUserId) ? (
                  <span className="text-purple-600 font-medium">
                    내 순서: {previewViewers.find(v => v.user_id === currentUserId)?.status === 'viewing'
                      ? '현재 보는 중!'
                      : `${previewViewers.find(v => v.user_id === currentUserId)?.position}번째`
                    }
                  </span>
                ) : (
                  <span>터치하여 상세 보기</span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 펼쳐진 상태 - 전체 목록 */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-100"
          >
            <div className="p-4 space-y-2 max-h-[350px] overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {queueList.viewers.map((viewer) => {
                  const isMe = viewer.user_id === currentUserId;
                  const isViewing = viewer.status === 'viewing';

                  return (
                    <motion.div
                      key={viewer.user_id}
                      layout
                      initial={{ opacity: 0, x: 100, scale: 0.8 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -100, scale: 0.8, transition: { duration: 0.3 } }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className={`
                        flex items-center gap-3 p-3 rounded-xl
                        ${isViewing
                          ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200'
                          : 'bg-gray-50 border border-transparent'
                        }
                        ${isMe ? 'ring-2 ring-purple-300 ring-offset-1' : ''}
                      `}
                    >
                      {/* 순서 번호 */}
                      <motion.div
                        layout
                        className={`
                          w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0
                          ${isViewing
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                            : 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-600'
                          }
                        `}
                      >
                        {isViewing ? (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </motion.div>
                        ) : (
                          <motion.span
                            key={viewer.position}
                            initial={{ scale: 1.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-lg"
                          >
                            {viewer.position}
                          </motion.span>
                        )}
                      </motion.div>

                      {/* 사용자 정보 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold truncate ${isMe ? 'text-purple-700' : 'text-gray-900'}`}>
                            {maskUserId(viewer.user_id)}
                          </span>
                          {isMe && (
                            <motion.span
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              className="text-[10px] font-bold px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-sm"
                            >
                              ME
                            </motion.span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatTime(viewer.joined_at)} 입장
                        </div>
                      </div>

                      {/* 상태 뱃지 */}
                      <motion.div
                        layout
                        className={`
                          text-xs font-bold px-3 py-1.5 rounded-full shrink-0 shadow-sm
                          ${isViewing
                            ? 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white'
                            : 'bg-gradient-to-r from-amber-400 to-orange-400 text-white'
                          }
                        `}
                      >
                        {isViewing ? (
                          <span className="flex items-center gap-1">
                            <motion.span
                              animate={{ opacity: [1, 0.5, 1] }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                              className="w-1.5 h-1.5 bg-white rounded-full"
                            />
                            보는 중
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <motion.span
                              animate={{ y: [0, -2, 0] }}
                              transition={{ repeat: Infinity, duration: 0.8 }}
                              className="w-1.5 h-1.5 bg-white rounded-full"
                            />
                            대기 중
                          </span>
                        )}
                      </motion.div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* 안내 문구 */}
            <div className="px-4 pb-4">
              <p className="text-xs text-gray-400 text-center py-2 border-t border-gray-100">
                순서가 되면 자동으로 입장됩니다
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
