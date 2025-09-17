'use client';

import { useEffect } from 'react';
import { initializeFetchInterceptor } from '@/lib/fetch-interceptor';

/**
 * Fetch Interceptorを最優先で初期化するコンポーネント
 * アプリケーション起動時に即座にfetchをインターセプトする
 */
export function FetchInterceptorInitializer() {
  useEffect(() => {
    // 可能な限り早期にfetch interceptorを初期化
    initializeFetchInterceptor();
  }, []);

  // このコンポーネントは何もレンダリングしない
  return null;
}
