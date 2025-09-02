'use client';

import { useFarcasterMiniApp } from '@/hooks/useFarcasterMiniApp';
import { useEffect } from 'react';

/**
 * Farcaster Mini Appの初期化を行うコンポーネント
 * アプリケーション起動時にsdk.actions.ready()を呼び出す
 */
export function FarcasterMiniAppInitializer() {
  const { isSDKLoaded, isReady, sdk } = useFarcasterMiniApp();

  useEffect(() => {
    // 初期化状態をログ出力
    if (isSDKLoaded) {
      console.log('Farcaster Mini App SDK loaded:', isReady);

      // SDKが準備できている場合はready()を呼び出す
      if (sdk && !isReady) {
        sdk.actions
          .ready()
          .then(() => {
            console.log('Farcaster Mini App SDK ready');
          })
          .catch((error) => {
            console.error(
              'Failed to initialize Farcaster Mini App SDK:',
              error,
            );
          });
      }
    }
  }, [isSDKLoaded, isReady, sdk]);

  // このコンポーネントは何も表示しない
  return null;
}
