import type { NextRequest } from 'next/server';

/**
 * サーバーサイドでのFarcaster環境検出のためのユーティリティ関数
 */

/**
 * リクエストからFarcaster Mini App環境かどうかを判定
 */
export function isFarcasterMiniAppRequest(req: NextRequest): boolean {
  // User Agentでの検出
  const userAgent = req.headers.get('user-agent') || '';
  const isInFarcaster =
    userAgent.includes('Farcaster') || userAgent.includes('farcaster');

  // URLパラメータでの検出
  const hasFarcasterParams =
    req.nextUrl.searchParams.has('farcaster') ||
    req.nextUrl.searchParams.has('fc') ||
    req.nextUrl.pathname.includes('farcaster');

  // Refererでの検出
  const referer = req.headers.get('referer') || '';
  const isFromFarcaster =
    referer.includes('farcaster') || referer.includes('warpcast');

  // X-Forwarded-For や他のヘッダーでの検出

  const origin = req.headers.get('origin') || '';
  const isFromFarcasterOrigin =
    origin.includes('farcaster') || origin.includes('warpcast');

  return (
    isInFarcaster ||
    hasFarcasterParams ||
    isFromFarcaster ||
    isFromFarcasterOrigin
  );
}

/**
 * Farcaster環境での認証チェックをより柔軟に行う
 */
export function shouldBypassAuthForFarcaster(req: NextRequest): boolean {
  const isFarcaster = isFarcasterMiniAppRequest(req);
  
  if (!isFarcaster) {
    return false;
  }

  // Farcaster環境では認証チェックを大幅に緩和
  const cookieSession = req.cookies.get('privy-session');
  const cookieAuthToken = req.cookies.get('privy-token');
  
  // セッションクッキーがある、またはリフレッシュから戻ってきた場合はバイパス
  const hasSession = Boolean(cookieSession);
  const hasAuthToken = Boolean(cookieAuthToken);
  const isFromRefresh = req.nextUrl.searchParams.has('redirect_uri');
  
  // Farcaster環境では、いずれかの条件でバイパス
  return hasSession || hasAuthToken || isFromRefresh;
}

/**
 * デバッグ情報を出力
 */
export function logFarcasterDebugInfo(
  req: NextRequest,
  definitelyAuthenticated: boolean,
): void {
  if (process.env.NODE_ENV !== 'development') return;

  const isFarcaster = isFarcasterMiniAppRequest(req);
  const userAgent = req.headers.get('user-agent') || '';
  const referer = req.headers.get('referer') || '';
  const origin = req.headers.get('origin') || '';
  const cookieAuthToken = req.cookies.get('privy-token');
  const cookieSession = req.cookies.get('privy-session');

  console.log('[Middleware Debug]', {
    path: req.nextUrl.pathname,
    isFarcaster,
    definitelyAuthenticated,
    userAgent: userAgent.substring(0, 100),
    referer: referer.substring(0, 100),
    origin,
    hasAuthToken: Boolean(cookieAuthToken),
    hasSession: Boolean(cookieSession),
    searchParams: Object.fromEntries(req.nextUrl.searchParams.entries()),
  });
}
