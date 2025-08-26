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
  const [isFarcasterEnvironment, setIsFarcasterEnvironment] = useState(false);

  useEffect(() => {
    const detectFarcasterEnvironment = () => {
      // Farcaster Mini App環境の検出
      const userAgent = navigator.userAgent;
      const isInFarcaster =
        userAgent.includes('Farcaster') ||
        userAgent.includes('farcaster') ||
        window.parent !== window; // iframe内で実行されているかチェック

      // URLパラメータからもFarcaster環境を検出
      const urlParams = new URLSearchParams(window.location.search);
      const hasFarcasterParams =
        urlParams.has('farcaster') ||
        urlParams.has('fc') ||
        window.location.href.includes('farcaster');

      return isInFarcaster || hasFarcasterParams;
    };

    const initializeMiniApp = async () => {
      try {
        const isFarcaster = detectFarcasterEnvironment();
        setIsFarcasterEnvironment(isFarcaster);

        if (isFarcaster && sdk && !isSDKLoaded) {
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
        } else if (!isFarcaster) {
          // Farcaster環境でない場合はスキップ
          console.log(
            'Not in Farcaster environment, skipping SDK initialization',
          );
          setIsSDKLoaded(true);
          setIsReady(true);
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
    isFarcasterEnvironment,
  };
}
