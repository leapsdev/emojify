'use client';

import { getFarcasterSDK } from '@/lib/farcaster';
import { createContext, useContext, useEffect, useState } from 'react';
import { FarcasterAuthProvider } from './FarcasterAuthProvider';
import { PrivyAuthProvider } from './PrivyProvider';

interface AuthProviderProps {
  children: React.ReactNode;
}

// Mini App判定のためのコンテキスト
interface MiniAppContextType {
  isMiniApp: boolean;
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
  const [isMiniApp, setIsMiniApp] = useState(false);

  // Mini App環境の判定
  useEffect(() => {
    const checkMiniApp = async (): Promise<void> => {
      try {
        const sdk = getFarcasterSDK();
        if (sdk) {
          // SDKが存在する場合、コンテキストを取得してMini App判定
          const context = await sdk.context;
          const miniAppStatus = !!context && Object.keys(context).length > 0;
          setIsMiniApp(miniAppStatus);
        } else {
          setIsMiniApp(false);
        }
      } catch {
        setIsMiniApp(false);
      }
    };
    checkMiniApp();
  }, []); // 依存配列からisMiniAppを削除して無限ループを防止

  // Mini App判定のコンテキスト値を提供
  const miniAppContextValue: MiniAppContextType = {
    isMiniApp,
  };

  return (
    <MiniAppContext.Provider value={miniAppContextValue}>
      <FarcasterAuthProvider>
        <PrivyAuthProvider>{children}</PrivyAuthProvider>
      </FarcasterAuthProvider>
    </MiniAppContext.Provider>
  );
}
