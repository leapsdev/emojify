/**
 * Farcaster MiniApp経由かどうかを判定する関数
 * シンプルで確実な検出方法のみを使用
 */
export function isFarcasterMiniApp(): boolean {
  if (typeof window === 'undefined') return false;

  // 1. Farcaster MiniApp SDKが利用可能かチェック
  if ((window as unknown as { farcaster?: unknown }).farcaster) {
    return true;
  }

  // 2. User-AgentでFarcasterアプリを検出
  const userAgent = window.navigator?.userAgent?.toLowerCase() || '';
  if (userAgent.includes('farcaster') || userAgent.includes('warpcast')) {
    return true;
  }

  return false;
}
