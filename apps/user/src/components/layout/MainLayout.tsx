'use client';

import { Header } from './Header';
import { Footer } from './Footer';
import { BlockedOverlay } from '../common/BlockedOverlay';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      {/* 보안 차단 오버레이 */}
      <BlockedOverlay />
    </div>
  );
}
