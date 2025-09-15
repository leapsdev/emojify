'use client';

import {
  type FarcasterContext,
  type FarcasterInitializationResult,
  getFarcasterSDK,
  initializeFarcasterMiniApp,
} from '@/lib/farcaster';
import { useCallback, useEffect, useState } from 'react';

interface UseFarcasterMiniAppReturn {
  isSDKLoaded: boolean;
  isReady: boolean;
  context: FarcasterContext | null;
  sdk: ReturnType<typeof getFarcasterSDK>;
  isMiniApp: boolean;
  error: string | null;
}

/**
 * Farcaster Mini App用のカスタムフック
 * SDK初期化、ready()呼び出し、Mini App検出を管理
 */
export function useFarcasterMiniApp(): UseFarcasterMiniAppReturn {
  const [state, setState] = useState<FarcasterInitializationResult>({
    isSDKLoaded: false,
    isReady: false,
    context: null,
    isMiniApp: false,
    error: null,
  });

  const initializeMiniApp = useCallback(async () => {
    if (state.isSDKLoaded) {
      return;
    }

    const result = await initializeFarcasterMiniApp();
    setState(result);
  }, [state.isSDKLoaded]);

  useEffect(() => {
    initializeMiniApp();
  }, [initializeMiniApp]);

  return {
    isSDKLoaded: state.isSDKLoaded,
    isReady: state.isReady,
    context: state.context,
    sdk: getFarcasterSDK(),
    isMiniApp: state.isMiniApp,
    error: state.error,
  };
}
