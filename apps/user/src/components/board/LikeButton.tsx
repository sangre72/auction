'use client';

import { useState } from 'react';
import { postsApi } from '@/lib/api';

interface LikeButtonProps {
  boardSlug: string;
  postId: number;
  initialLiked: boolean;
  initialCount: number;
  onAuthRequired?: () => void;
}

export function LikeButton({
  boardSlug,
  postId,
  initialLiked,
  initialCount,
  onAuthRequired,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await postsApi.toggleLike(boardSlug, postId);
      setLiked(response.data.liked);
      setCount(response.data.like_count);
    } catch (error) {
      const apiError = error as { status?: number };
      if (apiError?.status === 401) {
        onAuthRequired?.();
      } else {
        console.error('Failed to toggle like:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        liked
          ? 'bg-pink-50 text-pink-600 border border-pink-200'
          : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {isLoading ? (
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : (
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
      )}
      <span className="font-medium">{count}</span>
    </button>
  );
}
