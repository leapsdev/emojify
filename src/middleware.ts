import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

  // クッキーからトークンを取得
  const cookieAuthToken = req.cookies.get('privy-token')?.value;
  const cookieSession = req.cookies.get('privy-session')?.value;

  // Authorizationヘッダーからトークンを取得（Farcaster Mini App環境用）
  const authHeader = req.headers.get('authorization');
  const headerToken = authHeader?.startsWith('Bearer ')
    ? authHeader.replace('Bearer ', '')
    : null;

  // 未認証ページへのアクセスは許可
  if (UNAUTHENTICATED_PAGES.includes(req.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // OAuth認証フロー中の場合はミドルウェアをスキップ
  if (
    req.nextUrl.searchParams.get('privy_oauth_code') ||
    req.nextUrl.searchParams.get('privy_oauth_state') ||
    req.nextUrl.searchParams.get('privy_oauth_provider')
  ) {
    return NextResponse.next();
  }

  // リフレッシュページへのアクセスは許可
  if (req.nextUrl.pathname === '/refresh') {
    return NextResponse.next();
  }

  // トークンの存在確認（クッキーまたはヘッダー）
  const hasValidToken = Boolean(cookieAuthToken || headerToken);

  // privy-tokenがある場合は認証済み
  const definitelyAuthenticated = hasValidToken;
  // privy-sessionがある場合は認証が必要かもしれない
  const maybeAuthenticated = Boolean(cookieSession);

  if (!definitelyAuthenticated && maybeAuthenticated) {
    // 認証されていないが、認証が必要かもしれない場合は
    // /refreshページにリダイレクトしてクライアントサイドでリフレッシュを実行
    const redirectUrl = new URL('/refresh', req.url);
    redirectUrl.searchParams.set('redirect_uri', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (!definitelyAuthenticated) {
    return NextResponse.redirect(new URL('/signup', req.url));
  }

  return NextResponse.next();
}
