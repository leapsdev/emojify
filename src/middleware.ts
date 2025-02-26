import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const authToken = request.cookies.get('privy-token')?.value;

  if (!authToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // トークンが存在する場合は次のミドルウェアまたはページに進む
  return NextResponse.next();
}

// Next.jsのミドルウェア設定
// ルートパス(/)以外のすべてのパスで認証を要求
export const config = {
  matcher: [
    '/((?!api|_next|favicon.ico|$).*)'
  ]
};
