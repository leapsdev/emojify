'use client';

import { useFarcasterAuth } from '@/hooks/useFarcasterAuth';
import { useEffect } from 'react';

interface FarcasterAuthProviderProps {
  children: React.ReactNode;
}

/**
 * Farcaster SDK用のプロバイダー
 * - Service Worker登録（CORSエラー解決）
 * - Farcaster SDK初期化と自動ログイン
 */
export function FarcasterAuthProvider({
  children,
}: FarcasterAuthProviderProps) {
  // Farcaster SDKの初期化と自動ログインを実行
  useFarcasterAuth();

  // Service Worker登録（CORSエラー解決用）
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      registerFarcasterProxy();
    }
  }, []);

  const registerFarcasterProxy = async () => {
    try {
      await navigator.serviceWorker.register('/custom-sw.js', {
        scope: '/',
        updateViaCache: 'none',
      });
    } catch (error) {
      console.warn(
        '⚠️ Failed to register Farcaster proxy Service Worker:',
        error,
      );
    }
  };

  return <>{children}</>;
}
