'use client';

/**
 * 인증 설정 Provider
 *
 * React Context를 통해 인증 설정을 하위 컴포넌트에 제공합니다.
 *
 * @example
 * // app/layout.tsx
 * import { AuthProvider, createAuthConfig } from '@auction/shared';
 *
 * const authConfig = createAuthConfig({
 *   apiUrl: process.env.NEXT_PUBLIC_API_URL,
 *   endpoints: {
 *     login: '/api/auth/signin',
 *     me: '/api/auth/profile',
 *   },
 * });
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <AuthProvider config={authConfig}>
 *       {children}
 *     </AuthProvider>
 *   );
 * }
 */

import type { ReactNode } from 'react';
import { AuthConfigContext } from './useAuth';
import type { AuthConfig } from '../config';

interface AuthProviderProps {
  config: AuthConfig;
  children: ReactNode;
}

/**
 * 인증 설정 Provider 컴포넌트
 */
export function AuthProvider({ config, children }: AuthProviderProps) {
  return (
    <AuthConfigContext.Provider value={config}>
      {children}
    </AuthConfigContext.Provider>
  );
}
