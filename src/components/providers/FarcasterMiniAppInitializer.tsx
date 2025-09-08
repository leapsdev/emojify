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

      // 既に初期化済みの場合は何もしない
      if (isReady) {
        console.log('Farcaster Mini App SDK は既に初期化済みです');
        return;
      }

      // SDKが準備できている場合はready()を呼び出す
      if (sdk) {
        console.log('Farcaster Mini App SDK ready()を呼び出し中...');
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
