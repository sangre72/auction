'use client';

import { QueueProvider } from '@/contexts/QueueContext';
import { SessionTimeoutProvider } from './SessionTimeoutProvider';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueueProvider>
      <SessionTimeoutProvider>{children}</SessionTimeoutProvider>
    </QueueProvider>
  );
}
