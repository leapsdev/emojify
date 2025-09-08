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
          console.log('Farcaster Mini App SDK初期化開始...');

          // SDKの初期化を待つ
          await sdk.actions.ready();
          console.log('Farcaster Mini App is ready!');

          setIsSDKLoaded(true);
          setIsReady(true);

          // コンテキストを取得（非同期で実行）
          try {
            const ctx = await sdk.context;
            setContext(ctx);
            console.log('Farcaster context:', ctx);
          } catch (contextError) {
            console.warn('Farcaster context取得に失敗しました:', contextError);
            // コンテキスト取得に失敗してもアプリは動作させる
          }
        }
      } catch (error) {
        console.error('Mini App initialization error:', error);
        // エラーがあってもアプリは動作させる
        setIsSDKLoaded(true);
        setIsReady(true);
      }
    };

    // 少し遅延させてから初期化（他のライブラリの初期化を待つ）
    const timeoutId = setTimeout(initializeMiniApp, 500);

    return () => clearTimeout(timeoutId);
  }, [isSDKLoaded]);

  return {
    isSDKLoaded,
    isReady,
    context,
    sdk,
  };
}
