import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { detectEnvironmentFromRequest } from './lib/environment';

// 認証が不要なページの配列
const UNAUTHENTICATED_PAGES = ['/', '/signup'];

// 静的ファイルを検出する正規表現
const PUBLIC_FILE = /\.(.*)$/;

export const config = {
  matcher: [
    // 認証が必要なページのみをマッチ
    '/((?!api|_next|static|favicon.ico|manifest.json|sw.js|workbox-).*)',
  ],
};

export async function middleware(req: NextRequest) {
  // 静的ファイルへのリクエストはスキップ
  if (PUBLIC_FILE.test(req.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Farcaster環境の検出
  const environmentDetection = detectEnvironmentFromRequest(req);
  const { environment, isFarcasterEnvironment } = environmentDetection;

  // デバッグ情報をヘッダーに追加（開発環境のみ）
  const response = NextResponse.next();
  if (process.env.NODE_ENV === 'development') {
    response.headers.set('x-environment', environment);
    response.headers.set(
      'x-farcaster-detected',
      String(isFarcasterEnvironment),
    );
  }

  // 認証関連のクッキーを環境に応じてチェック
  const cookieAuthToken = req.cookies.get('privy-token');
  const cookieSession = req.cookies.get('privy-session');
  const cookieFirebaseToken = req.cookies.get('firebase-token');

  // 未認証ページへのアクセスは許可
  if (UNAUTHENTICATED_PAGES.includes(req.nextUrl.pathname)) {
    return response;
  }

  // OAuth認証フロー中の場合はミドルウェアをスキップ
  if (
    req.nextUrl.searchParams.get('privy_oauth_code') ||
    req.nextUrl.searchParams.get('privy_oauth_state') ||
    req.nextUrl.searchParams.get('privy_oauth_provider')
  ) {
    return response;
  }

  // リフレッシュページへのアクセスは許可
  if (req.nextUrl.pathname === '/refresh') {
    return response;
  }

  // Farcaster固有のパラメータがある場合は認証をより柔軟に処理
  const hasFarcasterParams = Boolean(
    req.nextUrl.searchParams.get('frame_url') ||
      req.nextUrl.searchParams.get('cast_hash') ||
      req.nextUrl.searchParams.get('fid') ||
      req.nextUrl.searchParams.get('fc_referrer') ||
      req.nextUrl.searchParams.get('miniapp') === 'true',
  );

  // 認証状態の判定
  const definitelyAuthenticated = Boolean(cookieAuthToken);
  const maybeAuthenticated = Boolean(cookieSession || cookieFirebaseToken);

  // Farcaster環境での特別な処理
  if (isFarcasterEnvironment || hasFarcasterParams) {
    // Farcaster環境では認証チェックをより柔軟にする
    if (!definitelyAuthenticated && !maybeAuthenticated) {
      // 認証トークンが全くない場合のみサインインページにリダイレクト
      const signInUrl = new URL('/signup', req.url);
      signInUrl.searchParams.set('fc_env', '1');
      // Farcasterパラメータを保持
      if (hasFarcasterParams) {
        req.nextUrl.searchParams.forEach((value, key) => {
          if (
            key.startsWith('fc_') ||
            key === 'frame_url' ||
            key === 'cast_hash' ||
            key === 'fid'
          ) {
            signInUrl.searchParams.set(key, value);
          }
        });
      }
      return NextResponse.redirect(signInUrl);
    }

    // 認証が曖昧な場合はリフレッシュを試行
    if (!definitelyAuthenticated && maybeAuthenticated) {
      const redirectUrl = new URL('/refresh', req.url);
      redirectUrl.searchParams.set(
        'redirect_uri',
        req.nextUrl.pathname + req.nextUrl.search,
      );
      redirectUrl.searchParams.set('fc_env', '1');
      return NextResponse.redirect(redirectUrl);
    }

    // Farcaster環境でのログを追加
    if (process.env.NODE_ENV === 'development') {
      console.log('Middleware - Farcaster environment detected:', {
        path: req.nextUrl.pathname,
        definitelyAuthenticated,
        maybeAuthenticated,
        hasFarcasterParams,
        detectionMethods: environmentDetection.detectionMethods,
      });
    }

    return response;
  }

  // 通常環境での処理（従来のロジック）
  if (!definitelyAuthenticated && maybeAuthenticated) {
    // 認証されていないが、認証が必要かもしれない場合は
    // /refreshページにリダイレクトしてクライアントサイドでリフレッシュを実行
    const redirectUrl = new URL('/refresh', req.url);
    redirectUrl.searchParams.set('redirect_uri', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // if (!definitelyAuthenticated) {
  //   return NextResponse.redirect(new URL('/signup', req.url));
  // }

  return response;
}
