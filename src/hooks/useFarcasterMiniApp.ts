'use client';

import { sdk } from '@farcaster/miniapp-sdk';
import { useEffect, useState } from 'react';

/**
 * Farcaster Mini App用のカスタムフック
 * SDK初期化とready()呼び出しを管理
 */
export function useFarcasterMiniApp() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [context, setContext] = useState<unknown>(null);

  useEffect(() => {
    const initializeMiniApp = async () => {
      try {
        if (sdk && !isSDKLoaded) {
          console.log('Initializing Farcaster Mini App...');

          // SDKの初期化を待つ
          await sdk.actions.ready();
          console.log('Farcaster Mini App is ready!');

          setIsSDKLoaded(true);
          setIsReady(true);

          // コンテキストを取得
          const ctx = await sdk.context;
          setContext(ctx);
          console.log('Farcaster context:', ctx);
        }
      } catch (error) {
        console.error('Mini App initialization error:', error);
        // エラーがあってもアプリは動作させる
        setIsSDKLoaded(true);
        setIsReady(true);
      }
    };

    initializeMiniApp();
  }, [isSDKLoaded]);

  return {
    isSDKLoaded,
    isReady,
    context,
  };
}
