'use client';

import { sdk } from '@farcaster/miniapp-sdk';
import { useCallback, useEffect, useState } from 'react';
import { useFarcasterEnvironment } from './useFarcasterEnvironment';

/**
 * Farcaster Mini App用のカスタムフック
 * SDK初期化とready()呼び出しを管理
 */
export function useFarcasterMiniApp() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [context, setContext] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // 環境検出フックを使用してFarcaster環境かどうか確認
  const { isFarcasterEnvironment, isDetectionComplete } =
    useFarcasterEnvironment();

  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000; // 1秒

  useEffect(() => {
    // 環境検出が完了するまで待機
    if (!isDetectionComplete) {
      return;
    }

    // Farcaster環境でない場合は初期化をスキップ
    if (!isFarcasterEnvironment) {
      console.log(
        'Not in Farcaster environment, skipping Mini App initialization',
      );
      setIsSDKLoaded(true);
      setIsReady(true);
      setContext(null);
      return;
    }

    const initializeMiniApp = async () => {
      try {
        setError(null);

        // SDKの存在確認
        if (!sdk) {
          throw new Error('Farcaster SDK not available');
        }

        if (!isSDKLoaded) {
          console.log('Initializing Farcaster Mini App...');

          // タイムアウト付きでSDKの初期化を待つ
          const initWithTimeout = Promise.race([
            sdk.actions.ready(),
            new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error('SDK initialization timeout')),
                10000,
              ),
            ),
          ]);

          await initWithTimeout;
          console.log('Farcaster Mini App is ready!');

          setIsSDKLoaded(true);
          setIsReady(true);

          // コンテキストを取得
          try {
            const ctx = await sdk.context;
            setContext(ctx);
            console.log('Farcaster context:', ctx);

            // コンテキストの検証
            if (ctx?.user) {
              console.log('Valid Farcaster context detected');
            } else {
              console.warn('Farcaster context is empty or invalid');
            }
          } catch (contextError) {
            console.warn('Failed to get Farcaster context:', contextError);
            // コンテキスト取得の失敗は初期化の失敗とはしない
            setContext(null);
          }

          // 初期化成功後のリセット
          setRetryCount(0);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        console.error('Mini App initialization error:', errorMessage);
        setError(errorMessage);

        // リトライロジック
        if (retryCount < MAX_RETRIES) {
          console.log(
            `Retrying Mini App initialization (${retryCount + 1}/${MAX_RETRIES})...`,
          );
          setTimeout(
            () => {
              setRetryCount((prev) => prev + 1);
              setIsSDKLoaded(false);
              setIsReady(false);
            },
            RETRY_DELAY * (retryCount + 1),
          ); // 指数的バックオフ
        } else {
          // 最大リトライに達した場合でもアプリは動作させる
          console.error('Max retries reached, continuing without Mini App SDK');
          setIsSDKLoaded(true);
          setIsReady(true);
          setContext(null);
        }
      }
    };

    initializeMiniApp();
  }, [isSDKLoaded, retryCount, isFarcasterEnvironment, isDetectionComplete]);

  // デバッグ情報のログ出力（開発環境のみ）
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && isFarcasterEnvironment) {
      console.log('Farcaster Mini App Hook State:', {
        isSDKLoaded,
        isReady,
        hasContext: !!context,
        error,
        retryCount,
        isFarcasterEnvironment,
        isDetectionComplete,
      });
    }
  }, [
    isSDKLoaded,
    isReady,
    context,
    error,
    retryCount,
    isFarcasterEnvironment,
    isDetectionComplete,
  ]);

  // Manual retry function
  const retry = useCallback(() => {
    if (retryCount < MAX_RETRIES) {
      setError(null);
      setRetryCount((prev) => prev + 1);
      setIsSDKLoaded(false);
      setIsReady(false);
    }
  }, [retryCount]);

  return {
    isSDKLoaded,
    isReady,
    context,
    error,
    retryCount,
    canRetry: retryCount < MAX_RETRIES,
    retry,
    isFarcasterEnvironment,
    isDetectionComplete,
  };
}
