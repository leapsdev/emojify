'use client';

import { useFarcasterMiniApp } from '@/hooks/useFarcasterMiniApp';

/**
 * Farcaster Mini Appの初期化を行うコンポーネント
 * アプリケーション起動時にuseFarcasterMiniAppフックを呼び出して初期化を実行
 */
export function FarcasterInitializer() {
  // フックを呼び出すことで初期化が実行される
  useFarcasterMiniApp();

  // このコンポーネントは何も表示しない
  return null;
}
