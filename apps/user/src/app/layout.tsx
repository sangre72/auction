import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { ClientProviders } from '@/components/providers/ClientProviders';
import { MainLayout } from '@/components/layout/MainLayout';
import './globals.css';

export const metadata: Metadata = {
  title: 'Auction - 피규어 경매',
  description: '피규어 슬롯 경매 플랫폼',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <ClientProviders>
          <MainLayout>{children}</MainLayout>
        </ClientProviders>
        <Toaster
          position="top-center"
          richColors
          expand
          closeButton
          duration={5000}
        />
      </body>
    </html>
  );
}
