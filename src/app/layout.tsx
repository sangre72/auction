import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Social Login Demo',
  description: 'OAuth social authentication with Kakao, Naver, and Google',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
