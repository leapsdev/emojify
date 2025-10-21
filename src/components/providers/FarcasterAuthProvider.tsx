'use client';

import { useIsMiniApp } from '@/components/providers/AuthProvider';
import { Loading } from '@/components/ui/Loading';
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
  const { isLoading } = useFarcasterAuth();
  const { isMiniApp } = useIsMiniApp();
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

  if (isMiniApp && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="md" text="Loading..." />
      </div>
    );
  }

  return <>{children}</>;
}
