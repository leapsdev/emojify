'use client';

import { useFarcasterMiniApp } from '@/hooks/useFarcasterMiniApp';
import { initializeFetchInterceptor } from '@/lib/fetch-interceptor';
import { useEffect } from 'react';
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
  const { isMiniApp, isSDKLoaded, error } = useFarcasterMiniApp();

  // Fetch interceptorを最優先で初期化
  useEffect(() => {
    initializeFetchInterceptor();
  }, []);

  // SDK読み込み中は何も表示しない（親でローディングを処理）
  if (!isSDKLoaded) {
    return null;
  }

  // SDK初期化エラーがある場合は通常のPrivy認証にフォールバック
  if (error) {
    console.warn(
      'Farcaster SDK初期化エラー、Privy認証にフォールバック:',
      error,
    );
    return <PrivyProvider>{children}</PrivyProvider>;
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
