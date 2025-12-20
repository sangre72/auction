'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { SessionTimeoutProvider } from '@/components/providers/SessionTimeoutProvider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionTimeoutProvider>
      <div className="flex h-screen bg-slate-950">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-6">
            {children}
          </main>
        </div>
      </div>
    </SessionTimeoutProvider>
  );
}
