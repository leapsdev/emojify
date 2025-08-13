'use client';

import { sdk } from '@farcaster/frame-sdk';
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
          // SDKの初期化を待つ
          await sdk.actions.ready();
          setIsSDKLoaded(true);
          setIsReady(true);

          // コンテキストを取得
          const ctx = await sdk.context;
          setContext(ctx);
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
