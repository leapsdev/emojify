import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 静的ファイルを検出する正規表現
const PUBLIC_FILE = /\.(.*)$/;

export const config = {
  matcher: [
    // 静的ファイル以外の全てのページをマッチ
    '/((?!api|_next|static|favicon.ico|manifest.json|sw.js|workbox-).*)',
  ],
};

export async function middleware(req: NextRequest) {
  // 静的ファイルへのリクエストはスキップ
  if (PUBLIC_FILE.test(req.nextUrl.pathname)) {
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

  return NextResponse.next();
}
