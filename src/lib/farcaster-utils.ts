'use client';

/**
 * Farcaster環境検出のためのユーティリティ関数
 */

/**
 * 現在の環境がFarcaster Mini Appかどうかを判定
 */
export function isFarcasterMiniAppEnvironment(): boolean {
  if (typeof window === 'undefined') return false;

  // User Agentでの検出
  const userAgent = navigator.userAgent;
  const isInFarcaster =
    userAgent.includes('Farcaster') || userAgent.includes('farcaster');

  // iframeでの実行チェック
  const isInIframe = window.parent !== window;

  // URLパラメータでの検出
  const urlParams = new URLSearchParams(window.location.search);
  const hasFarcasterParams =
    urlParams.has('farcaster') ||
    urlParams.has('fc') ||
    window.location.href.includes('farcaster');

  // Farcaster SDK の存在チェック
  const hasFarcasterSDK =
    typeof window !== 'undefined' && 'farcaster' in window;

  return isInFarcaster || isInIframe || hasFarcasterParams || hasFarcasterSDK;
}

/**
 * Farcaster環境でのクッキー設定に適した属性を取得
 */
export function getFarcasterCookieAttributes(): string {
  const isFarcaster = isFarcasterMiniAppEnvironment();

  if (isFarcaster) {
    // Farcaster Mini App環境では SameSite=None を使用
    return 'path=/; max-age=3600; secure; samesite=none';
  }
  // 通常のWeb環境では SameSite=Strict を使用
  return 'path=/; max-age=3600; secure; samesite=strict';
}

/**
 * Farcaster環境での認証完了を待機
 */
export function waitForFarcasterAuth(timeout = 10000): Promise<boolean> {
  return new Promise((resolve) => {
    if (!isFarcasterMiniAppEnvironment()) {
      resolve(true);
      return;
    }

    let attempts = 0;
    const maxAttempts = timeout / 500; // 500ms間隔でチェック

    const checkAuth = () => {
      attempts++;

      // Farcaster SDKが利用可能かチェック
      if (typeof window !== 'undefined' && 'farcaster' in window) {
        resolve(true);
        return;
      }

      if (attempts >= maxAttempts) {
        console.warn('Farcaster auth timeout, proceeding anyway');
        resolve(true);
        return;
      }

      setTimeout(checkAuth, 500);
    };

    checkAuth();
  });
}
