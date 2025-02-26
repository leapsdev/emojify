import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PrivyClient } from '@privy-io/server-auth';

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID || '',
  process.env.PRIVY_APP_SECRET || ''
);

export async function middleware(request: NextRequest) {
  const authToken = request.cookies.get('privy-token')?.value;

  if (!authToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  try {
    await privy.verifyAuthToken(authToken);
    return NextResponse.next();
  } catch (error) {
    console.error('認証エラー:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}

// Next.jsのミドルウェア設定
// ルートパス(/)以外のすべてのパスで認証を要求
export const config = {
  matcher: [
    '/((?!api|_next|favicon.ico|$).*)'
  ]
};
