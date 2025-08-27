'use client';

import { getTokenStorage, isFarcasterMiniApp } from '@/lib/utils';
import { sdk } from '@farcaster/miniapp-sdk';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Farcaster Mini App用のカスタムフック
 * SDK初期化とready()呼び出しを管理
 */
export function useFarcasterMiniApp() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [context, setContext] = useState<unknown>(null);
  const [isFarcasterEnv, setIsFarcasterEnv] = useState(false);

  // 初期化の重複実行を防ぐためのフラグ
  const isInitializing = useRef(false);

  useEffect(() => {
    const initializeMiniApp = async () => {
      // 既に初期化中の場合はスキップ
      if (isInitializing.current || isSDKLoaded) {
        return;
      }

      try {
        isInitializing.current = true;

        if (sdk) {
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

          // Farcaster環境かどうかを確認
          const isFarcaster = isFarcasterMiniApp();
          setIsFarcasterEnv(isFarcaster);

          if (isFarcaster) {
            console.log('Running in Farcaster Mini App environment');
          }
        }
      } catch (error) {
        console.error('Mini App initialization error:', error);
        // エラーがあってもアプリは動作させる
        setIsSDKLoaded(true);
        setIsReady(true);
      } finally {
        isInitializing.current = false;
      }
    };

    initializeMiniApp();
  }, [isSDKLoaded]);

  // Farcaster環境でのトークン管理（メモ化して無限ループを防ぐ）
  const getStoredToken = useCallback(() => {
    if (isFarcasterEnv) {
      const tokenStorage = getTokenStorage();
      return tokenStorage.getToken();
    }
    return null;
  }, [isFarcasterEnv]);

  const setStoredToken = useCallback(
    (token: string) => {
      if (isFarcasterEnv) {
        const tokenStorage = getTokenStorage();
        tokenStorage.setToken(token);
      }
    },
    [isFarcasterEnv],
  );

  const removeStoredToken = useCallback(() => {
    if (isFarcasterEnv) {
      const tokenStorage = getTokenStorage();
      tokenStorage.removeToken();
    }
  }, [isFarcasterEnv]);

  return {
    isSDKLoaded,
    isReady,
    context,
    isFarcasterEnv,
    getStoredToken,
    setStoredToken,
    removeStoredToken,
  };
}
