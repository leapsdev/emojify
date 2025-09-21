'use client';

import { useFarcasterMiniApp } from '@/hooks/useFarcasterMiniApp';
import { createContext, useContext } from 'react';
import { FarcasterAuthProvider } from './FarcasterAuthProvider';
import { FarcasterProxyProvider } from './FarcasterProxyProvider';
import { PrivyProvider } from './PrivyProvider';

interface AuthProviderProps {
  children: React.ReactNode;
}

// Mini App判定のためのコンテキスト
interface MiniAppContextType {
  isMiniApp: boolean;
  isSDKLoaded: boolean;
  error: string | null;
}

const MiniAppContext = createContext<MiniAppContextType | null>(null);

export function useIsMiniApp(): MiniAppContextType {
  const context = useContext(MiniAppContext);
  if (!context) {
    throw new Error('useIsMiniApp must be used within AuthProvider');
  }
  return context;
}

/**
 * 統合認証プロバイダー
 * 両方の認証方式（Farcaster + Privy）を同時に提供
 * isMiniApp判定メソッドも提供
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { isMiniApp, isSDKLoaded, error } = useFarcasterMiniApp();

  // Mini App判定のコンテキスト値を提供
  const miniAppContextValue: MiniAppContextType = {
    isMiniApp,
    isSDKLoaded,
    error,
  };

  return (
    <MiniAppContext.Provider value={miniAppContextValue}>
      <FarcasterProxyProvider>
        <FarcasterAuthProvider>
          <PrivyProvider>{children}</PrivyProvider>
        </FarcasterAuthProvider>
      </FarcasterProxyProvider>
    </MiniAppContext.Provider>
  );
}
