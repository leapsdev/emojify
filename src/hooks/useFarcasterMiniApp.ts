'use client';

import { initializeFarcasterMiniApp } from '@/lib/farcaster';
import { useCallback, useEffect, useState } from 'react';

interface FarcasterMiniAppState {
  isSDKLoaded: boolean;
  isReady: boolean;
  context: Record<string, unknown> | null;
  isMiniApp: boolean;
  error: string | null;
}

/**
 * Farcaster Mini App SDKの初期化を管理するフック
 */
export function useFarcasterMiniApp() {
  const [state, setState] = useState<FarcasterMiniAppState>({
    isSDKLoaded: false,
    isReady: false,
    context: null,
    isMiniApp: false,
    error: null,
  });

  const initializeSDK = useCallback(async () => {
    if (state.isSDKLoaded) {
      return;
    }

    try {
      console.log('🔧 useFarcasterMiniApp: SDK初期化開始');
      const result = await initializeFarcasterMiniApp();
      console.log('🔧 useFarcasterMiniApp: 初期化結果:', result);

      setState({
        isSDKLoaded: result.isSDKLoaded,
        isReady: result.isReady,
        context: result.context,
        isMiniApp: result.isMiniApp,
        error: result.error,
      });

      console.log('🔧 useFarcasterMiniApp: 初期化完了');
    } catch (error) {
      console.error('🔧 useFarcasterMiniApp: 初期化エラー:', error);
      setState({
        isSDKLoaded: true,
        isReady: false,
        context: null,
        isMiniApp: false,
        error: error instanceof Error ? error.message : 'SDK初期化エラー',
      });
    }
  }, [state.isSDKLoaded]);

  useEffect(() => {
    initializeSDK();
  }, [initializeSDK]);

  return {
    isSDKLoaded: state.isSDKLoaded,
    isReady: state.isReady,
    context: state.context,
    isMiniApp: state.isMiniApp,
    error: state.error,
  };
}
