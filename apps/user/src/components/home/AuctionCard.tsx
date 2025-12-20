'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useQueue } from '@/contexts/QueueContext';
import { formatPrice } from '@auction/shared';

interface AuctionCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  currentPrice: number;
  startPrice: number;
  endTime: Date;
  bidCount: number;
  viewCount: number;
  isLiked?: boolean;
  onLike?: (id: string) => void;
}

export function AuctionCard({
  id,
  title,
  description,
  imageUrl,
  currentPrice,
  startPrice,
  endTime,
  bidCount,
  viewCount,
  isLiked = false,
  onLike,
}: AuctionCardProps) {
  const [liked, setLiked] = useState(isLiked);
  const [isHovered, setIsHovered] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const { joinQueue, getQueueEntry } = useQueue();

  const queueEntry = getQueueEntry(Number(id));
  const isInQueue = queueEntry && !queueEntry.isAllowed;

  const handleCardClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isJoining) return;

    setIsJoining(true);
    try {
      await joinQueue(Number(id));
    } finally {
      setIsJoining(false);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked(!liked);
    onLike?.(id);
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();

    if (diff <= 0) return '종료됨';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}일 ${hours}시간`;
    if (hours > 0) return `${hours}시간 ${minutes}분`;
    return `${minutes}분`;
  };

  const discountRate = Math.round((1 - startPrice / currentPrice) * 100);

  return (
    <div
      onClick={handleCardClick}
      className={`group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer ${isJoining ? 'opacity-70 pointer-events-none' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
        {/* 이미지 영역 - 3:4 비율 (피규어에 최적화) */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-cyan-100 flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          {/* 남은 시간 뱃지 */}
          <div className="absolute top-3 left-3 px-3 py-1.5 bg-black/70 backdrop-blur-sm text-white text-sm font-medium rounded-lg">
            {getTimeRemaining()} 남음
          </div>

          {/* 관심 버튼 */}
          <button
            onClick={handleLike}
            className={`absolute top-3 right-3 p-2.5 rounded-full transition-all ${
              liked
                ? 'bg-red-500 text-white'
                : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-red-500'
            }`}
          >
            <svg
              className="w-5 h-5"
              fill={liked ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>

          {/* 대기열 상태 뱃지 */}
          {isInQueue && (
            <div className="absolute bottom-3 left-3 right-3 px-3 py-2 bg-purple-600/90 backdrop-blur-sm text-white text-sm font-medium rounded-lg text-center">
              <span className="inline-flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                대기 중 {queueEntry?.position}번째
              </span>
            </div>
          )}

          {/* 호버 오버레이 */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
              isHovered && !isInQueue ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <button
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold rounded-xl shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
                disabled={isJoining}
              >
                {isJoining ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    연결 중...
                  </>
                ) : (
                  '입찰 참여하기'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1 group-hover:text-purple-600 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
            {description}
          </p>

          {/* 가격 정보 */}
          <div className="mb-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(currentPrice)}원
              </span>
              {discountRate > 0 && (
                <span className="text-sm font-medium text-red-500">
                  {discountRate}%↑
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400">
              시작가 {formatPrice(startPrice)}원
            </p>
          </div>

          {/* 참여 정보 */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>{bidCount}명 참여</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{viewCount}</span>
            </div>
          </div>
        </div>
      </div>
  );
}
