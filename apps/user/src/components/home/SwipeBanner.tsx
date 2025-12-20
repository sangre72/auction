'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Banner {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
  backgroundColor?: string;
}

interface SwipeBannerProps {
  banners?: Banner[];
}

const defaultBanners: Banner[] = [
  {
    id: '1',
    title: '신규 회원 특별 혜택',
    description: '지금 가입하고 5,000 포인트 받으세요',
    imageUrl: '/images/banner1.jpg',
    linkUrl: '/events/welcome',
    backgroundColor: 'from-purple-600 to-indigo-600',
  },
  {
    id: '2',
    title: '주간 인기 경매',
    description: '이번 주 가장 핫한 경매 상품들을 만나보세요',
    imageUrl: '/images/banner2.jpg',
    linkUrl: '/auctions/popular',
    backgroundColor: 'from-cyan-500 to-blue-600',
  },
  {
    id: '3',
    title: '특가 경매 이벤트',
    description: '최대 90% 할인된 가격으로 시작하세요',
    imageUrl: '/images/banner3.jpg',
    linkUrl: '/events/sale',
    backgroundColor: 'from-pink-500 to-rose-600',
  },
];

export function SwipeBanner({ banners = defaultBanners }: SwipeBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  const currentBanner = banners[currentIndex];

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* 배너 슬라이드 */}
      <div className="relative h-[300px] sm:h-[400px] lg:h-[500px]">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-all duration-500 ease-in-out ${
              index === currentIndex
                ? 'opacity-100 translate-x-0'
                : index < currentIndex
                ? 'opacity-0 -translate-x-full'
                : 'opacity-0 translate-x-full'
            }`}
          >
            <Link href={banner.linkUrl} className="block h-full">
              <div className={`relative h-full bg-gradient-to-br ${banner.backgroundColor || 'from-gray-800 to-gray-900'}`}>
                {/* 배경 패턴 */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2230%22 height=%2230%22 viewBox=%220 0 30 30%22 fill=%22none%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M1.22676 0C1.91374 0 2.45351 0.539773 2.45351 1.22676C2.45351 1.91374 1.91374 2.45351 1.22676 2.45351C0.539773 2.45351 0 1.91374 0 1.22676C0 0.539773 0.539773 0 1.22676 0Z%22 fill=%22rgba(255,255,255,0.1)%22/%3E%3C/svg%3E')] opacity-50"></div>

                {/* 컨텐츠 */}
                <div className="relative h-full flex items-center">
                  <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full">
                    <div className="max-w-xl">
                      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                        {banner.title}
                      </h2>
                      <p className="text-lg sm:text-xl text-white/90 mb-6 drop-shadow">
                        {banner.description}
                      </p>
                      <span className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 transition-colors">
                        자세히 보기
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* 좌우 네비게이션 */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* 인디케이터 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              index === currentIndex
                ? 'bg-white w-8'
                : 'bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
