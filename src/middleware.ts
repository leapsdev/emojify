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

  // Farcaster Mini App環境でのクッキー取得を強化
  const cookieAuthToken = req.cookies.get('privy-token');
  const cookieSession = req.cookies.get('privy-session');
  
  // デバッグ用：クッキーの状態をログ出力（開発環境のみ）
  if (process.env.NODE_ENV === 'development') {
    console.log('Middleware Debug Info:');
    console.log('URL:', req.nextUrl.pathname);
    console.log('User-Agent:', req.headers.get('user-agent'));
    console.log('Origin:', req.headers.get('origin'));
    console.log('Referer:', req.headers.get('referer'));
    console.log('privy-token exists:', !!cookieAuthToken);
    console.log('privy-session exists:', !!cookieSession);
    console.log('All cookies:', req.cookies.getAll());
  }

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

  // privy-tokenがある場合は認証済み
  const definitelyAuthenticated = Boolean(cookieAuthToken);
  // privy-sessionがある場合は認証が必要かもしれない
  const maybeAuthenticated = Boolean(cookieSession);

  if (!definitelyAuthenticated && maybeAuthenticated) {
    // 認証されていないが、認証が必要かもしれない場合は
    // /refreshページにリダイレクトしてクライアントサイドでリフレッシュを実行
    const redirectUrl = new URL('/refresh', req.url);
    redirectUrl.searchParams.set('redirect_uri', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Farcaster Mini App環境での特別な処理
  // クッキーが取得できない場合は、認証状態を確認するためのAPIエンドポイントを呼び出す
  if (!definitelyAuthenticated && !maybeAuthenticated) {
    // Farcaster Mini App環境かどうかを判定
    const isFarcasterMiniApp = req.headers.get('user-agent')?.includes('Farcaster') || 
                               req.headers.get('origin')?.includes('farcaster.xyz');
    
    if (isFarcasterMiniApp) {
      // Farcaster Mini App環境では、クッキーが取得できない場合があるため
      // 認証状態を確認するためのAPIエンドポイントを呼び出す
      // ここでは一時的にアクセスを許可し、クライアントサイドで認証状態を確認する
      return NextResponse.next();
    }
  }

  if (!definitelyAuthenticated) {
    return NextResponse.redirect(new URL('/signup', req.url));
  }

  return NextResponse.next();
}
