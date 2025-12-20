'use client';

import { QueueProvider } from '@/contexts/QueueContext';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <QueueProvider>{children}</QueueProvider>;
}
