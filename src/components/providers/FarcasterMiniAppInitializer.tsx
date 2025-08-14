'use client';

import { useFarcasterMiniApp } from '@/hooks/useFarcasterMiniApp';
import { useEffect } from 'react';

/**
 * Farcaster Mini Appの初期化を行うコンポーネント
 * アプリケーション起動時にsdk.actions.ready()を呼び出す
 */
export function FarcasterMiniAppInitializer() {
  const { isSDKLoaded, isReady } = useFarcasterMiniApp();

  useEffect(() => {
    // 初期化状態をログ出力
    if (isSDKLoaded) {
      console.log('Farcaster Mini App SDK loaded:', isReady);
    }
  }, [isSDKLoaded, isReady]);

  // このコンポーネントは何も表示しない
  return null;
}
