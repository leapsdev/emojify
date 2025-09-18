'use client';

import { useFarcasterMiniApp } from '@/hooks/useFarcasterMiniApp';
import { FarcasterAuthProvider } from './FarcasterAuthProvider';
import { FarcasterProxyProvider } from './FarcasterProxyProvider';
import { PrivyProvider } from './PrivyProvider';

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * 統合認証プロバイダー
 * Farcaster Mini App環境ではFarcaster認証を使用
 * 通常のWeb環境では既存のPrivy認証を使用
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { isMiniApp, isSDKLoaded } = useFarcasterMiniApp();

  // SDK読み込み中は何も表示しない（親でローディングを処理）
  if (!isSDKLoaded) {
    return null;
  }

  // Farcaster Mini App環境ではFarcaster認証を使用
  if (isMiniApp) {
    return (
      <FarcasterProxyProvider>
        <FarcasterAuthProvider>{children}</FarcasterAuthProvider>
      </FarcasterProxyProvider>
    );
  }

  // 通常のWeb環境では既存のPrivy認証を使用
  return <PrivyProvider>{children}</PrivyProvider>;
}
