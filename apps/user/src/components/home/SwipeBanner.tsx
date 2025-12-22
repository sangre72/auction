'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { bannersApi, BannerPublic } from '@/lib/api';

interface SwipeBannerProps {
  position?: string;
}

export function SwipeBanner({ position = 'main_top' }: SwipeBannerProps) {
  const [banners, setBanners] = useState<BannerPublic[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedBannerId, setExpandedBannerId] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const viewedBanners = useRef<Set<number>>(new Set());

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 배너 데이터 로드
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setIsLoading(true);
        const response = await bannersApi.getActive(position);
        setBanners(response.data);
      } catch (error) {
        console.error('Failed to fetch banners:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBanners();
  }, [position]);

  // 조회수 기록 (배너가 보일 때)
  useEffect(() => {
    if (banners.length === 0) return;
    const currentBanner = banners[currentIndex];
    if (currentBanner && !viewedBanners.current.has(currentBanner.id)) {
      viewedBanners.current.add(currentBanner.id);
      bannersApi.recordView(currentBanner.id).catch(() => {});
    }
  }, [currentIndex, banners]);

  const nextSlide = useCallback(() => {
    if (banners.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % banners.length);
    setExpandedBannerId(null);
  }, [banners.length]);

  const prevSlide = () => {
    if (banners.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    setExpandedBannerId(null);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setExpandedBannerId(null);
  };

  useEffect(() => {
    if (!isAutoPlaying || banners.length <= 1 || expandedBannerId !== null) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, banners.length, expandedBannerId]);

  const handleBannerClick = (banner: BannerPublic) => {
    // 클릭수 기록
    bannersApi.recordClick(banner.id).catch(() => {});

    // HTML 콘텐츠가 있으면 확장/축소 토글
    if (banner.html_content) {
      setExpandedBannerId(expandedBannerId === banner.id ? null : banner.id);
      setIsAutoPlaying(expandedBannerId !== banner.id ? false : true);
    } else if (banner.link_url) {
      // 링크가 있으면 새 창에서 열기
      window.open(banner.link_url, banner.link_target || '_blank');
    }
  };

  const handleLinkClick = (e: React.MouseEvent, banner: BannerPublic) => {
    e.stopPropagation();
    bannersApi.recordClick(banner.id).catch(() => {});
    if (banner.link_url) {
      window.open(banner.link_url, banner.link_target || '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500/20 to-cyan-500/20 animate-pulse">
        <div className="h-[300px] sm:h-[400px] lg:h-[500px]" />
      </div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];
  const isExpanded = expandedBannerId === currentBanner?.id;

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      onMouseEnter={() => !isExpanded && setIsAutoPlaying(false)}
      onMouseLeave={() => !isExpanded && setIsAutoPlaying(true)}
    >
      {/* 배너 슬라이드 */}
      <div className={`relative transition-all duration-500 ${isExpanded ? 'h-auto min-h-[300px]' : 'h-[300px] sm:h-[400px] lg:h-[500px]'}`}>
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-all duration-500 ease-in-out ${
              index === currentIndex
                ? 'opacity-100 translate-x-0 z-10'
                : index < currentIndex
                ? 'opacity-0 -translate-x-full z-0'
                : 'opacity-0 translate-x-full z-0'
            }`}
          >
            <div
              onClick={() => handleBannerClick(banner)}
              className="relative h-full cursor-pointer"
            >
              {/* 배너 이미지 */}
              {(isMobile ? banner.mobile_image_url : banner.image_url) || banner.image_url ? (
                <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] w-full">
                  <Image
                    src={(isMobile ? banner.mobile_image_url : banner.image_url) || banner.image_url || ''}
                    alt={banner.alt_text || banner.title}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                  {/* 오버레이 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
              ) : (
                <div className="h-[300px] sm:h-[400px] lg:h-[500px] bg-gradient-to-br from-purple-600 to-cyan-600">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2230%22 height=%2230%22 viewBox=%220 0 30 30%22 fill=%22none%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M1.22676 0C1.91374 0 2.45351 0.539773 2.45351 1.22676C2.45351 1.91374 1.91374 2.45351 1.22676 2.45351C0.539773 2.45351 0 1.91374 0 1.22676C0 0.539773 0.539773 0 1.22676 0Z%22 fill=%22rgba(255,255,255,0.1)%22/%3E%3C/svg%3E')] opacity-50" />
                </div>
              )}

              {/* 배너 텍스트 컨텐츠 */}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-12">
                <div className="max-w-xl">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                    {banner.title}
                  </h2>
                  {banner.description && (
                    <p className="text-base sm:text-lg text-white/90 mb-4 drop-shadow line-clamp-2">
                      {banner.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3">
                    {banner.link_url && (
                      <button
                        onClick={(e) => handleLinkClick(e, banner)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white font-medium rounded-xl hover:bg-white/30 transition-colors"
                      >
                        자세히 보기
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                    {banner.html_content && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBannerClick(banner);
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-500/80 backdrop-blur-sm text-white font-medium rounded-xl hover:bg-purple-500 transition-colors"
                      >
                        {isExpanded ? '접기' : '상세정보'}
                        <svg
                          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 확장된 HTML 콘텐츠 */}
      {isExpanded && currentBanner?.html_content && (
        <div className="relative z-20 bg-white overflow-hidden transition-all duration-500 ease-in-out">
          <div
            className="p-6 sm:p-8 prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: currentBanner.html_content }}
          />
          <button
            onClick={() => {
              setExpandedBannerId(null);
              setIsAutoPlaying(true);
            }}
            className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* 좌우 네비게이션 */}
      {banners.length > 1 && !isExpanded && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* 인디케이터 */}
      {banners.length > 1 && !isExpanded && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2.5 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/70 w-2.5'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
