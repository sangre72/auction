'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SwipeBanner } from '@/components/home/SwipeBanner';
import { AuctionCard } from '@/components/home/AuctionCard';
import { productsApi, ProductListItem } from '@/lib/api';

type SortType = 'ending' | 'popular' | 'new' | 'lowPrice' | 'highPrice';

const sortOptions: { key: SortType; label: string }[] = [
  { key: 'ending', label: '마감임박' },
  { key: 'popular', label: '인기순' },
  { key: 'new', label: '신규등록' },
  { key: 'lowPrice', label: '낮은가격' },
  { key: 'highPrice', label: '높은가격' },
];

export default function Home() {
  const [activeSort, setActiveSort] = useState<SortType>('ending');
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await productsApi.getList({ page: 1, page_size: 20 });
      setProducts(response.data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('상품을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const getSortedProducts = () => {
    const sorted = [...products];

    switch (activeSort) {
      case 'ending':
        return sorted.sort((a, b) => {
          const aTime = a.end_time ? new Date(a.end_time).getTime() : Infinity;
          const bTime = b.end_time ? new Date(b.end_time).getTime() : Infinity;
          return aTime - bTime;
        });
      case 'popular':
        return sorted.sort((a, b) => b.bid_count - a.bid_count);
      case 'new':
        return sorted.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case 'lowPrice':
        return sorted.sort((a, b) => {
          const aPrice = a.slot_price || a.current_price || a.starting_price;
          const bPrice = b.slot_price || b.current_price || b.starting_price;
          return aPrice - bPrice;
        });
      case 'highPrice':
        return sorted.sort((a, b) => {
          const aPrice = a.slot_price || a.current_price || a.starting_price;
          const bPrice = b.slot_price || b.current_price || b.starting_price;
          return bPrice - aPrice;
        });
      default:
        return sorted;
    }
  };

  const mapProductToCardProps = (product: ProductListItem) => ({
    id: String(product.id),
    title: product.title,
    description: product.description || product.category_name || product.category || '',
    imageUrl: product.thumbnail_url || '/images/placeholder.jpg',
    currentPrice: product.slot_price || product.current_price || product.starting_price,
    startPrice: product.starting_price,
    endTime: product.end_time ? new Date(product.end_time) : new Date(Date.now() + 24 * 60 * 60 * 1000),
    bidCount: product.bid_count,
    viewCount: product.sold_slot_count,
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1">
        {/* 스와이프 배너 */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <SwipeBanner />
        </section>

        {/* 경매 상품 섹션 */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 정렬 탭 */}
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
            {sortOptions.map((option) => (
              <button
                key={option.key}
                onClick={() => setActiveSort(option.key)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeSort === option.key
                    ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* 로딩 상태 */}
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-500 border-t-transparent"></div>
            </div>
          )}

          {/* 에러 상태 */}
          {error && !isLoading && (
            <div className="text-center py-20">
              <p className="text-gray-500 mb-4">{error}</p>
              <button
                onClick={fetchProducts}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                다시 시도
              </button>
            </div>
          )}

          {/* 상품 없음 */}
          {!isLoading && !error && products.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🎭</div>
              <p className="text-gray-500">현재 진행 중인 경매가 없습니다.</p>
            </div>
          )}

          {/* 상품 그리드 */}
          {!isLoading && !error && products.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {getSortedProducts().map((product) => (
                <AuctionCard key={product.id} {...mapProductToCardProps(product)} />
              ))}
            </div>
          )}
        </section>

        {/* 참여 유도 섹션 */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-gradient-to-r from-purple-600 to-cyan-500 rounded-2xl p-8 sm:p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2230%22 height=%2230%22 viewBox=%220 0 30 30%22 fill=%22none%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M1.22676 0C1.91374 0 2.45351 0.539773 2.45351 1.22676C2.45351 1.91374 1.91374 2.45351 1.22676 2.45351C0.539773 2.45351 0 1.91374 0 1.22676C0 0.539773 0.539773 0 1.22676 0Z%22 fill=%22rgba(255,255,255,0.1)%22/%3E%3C/svg%3E')] opacity-50"></div>

            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                지금 바로 경매에 참여하세요!
              </h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                회원가입하고 첫 경매 참여 시 5,000 포인트를 드립니다.
                <br />
                원하는 피규어를 최저가로 낙찰받아 보세요.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/auth/login"
                  className="px-8 py-4 bg-white text-purple-600 font-semibold rounded-xl shadow-lg hover:bg-gray-100 transition-colors"
                >
                  회원가입하기
                </a>
                <a
                  href="/guide"
                  className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl hover:bg-white/30 transition-colors"
                >
                  이용방법 알아보기
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 카테고리 섹션 */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">카테고리별 탐색</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: '스케일 피규어', icon: '🎭', color: 'from-purple-500 to-indigo-500' },
              { name: '넨도로이드', icon: '🧸', color: 'from-pink-500 to-rose-500' },
              { name: '프라이즈', icon: '🏆', color: 'from-amber-500 to-orange-500' },
              { name: '프라모델', icon: '🤖', color: 'from-blue-500 to-cyan-500' },
              { name: '굿즈/MD', icon: '🎁', color: 'from-green-500 to-emerald-500' },
              { name: '한정판', icon: '✨', color: 'from-red-500 to-pink-500' },
            ].map((category) => (
              <a
                key={category.name}
                href={`/auctions?category=${category.name}`}
                className="group flex flex-col items-center p-6 bg-white rounded-2xl border border-gray-100 hover:shadow-lg transition-all"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform`}>
                  {category.icon}
                </div>
                <span className="font-medium text-gray-700 group-hover:text-purple-600 transition-colors">
                  {category.name}
                </span>
              </a>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
