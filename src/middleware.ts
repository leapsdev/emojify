import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 認証が不要なページの配列
const UNAUTHENTICATED_PAGES = [
  '/',
];

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};

export async function middleware(req: NextRequest) {
  const cookieAuthToken = req.cookies.get('privy-token');
  const cookieSession = req.cookies.get('privy-session');

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

  if (!definitelyAuthenticated) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}
