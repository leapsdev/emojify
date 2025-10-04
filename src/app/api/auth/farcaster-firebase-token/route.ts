import { getFirebaseCustomTokenFromFarcaster } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // リクエストボディからウォレットアドレスを取得
    const body = await request.json().catch(() => ({}));
    const walletAddress = body.walletAddress as string | undefined;

    // AuthorizationヘッダーからFarcaster JWTを取得
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const farcasterToken = authHeader.replace('Bearer ', '');
    if (!farcasterToken) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // Firebaseカスタムトークンを取得
    const customToken = await getFirebaseCustomTokenFromFarcaster(
      farcasterToken,
      walletAddress,
    );

    if (!customToken) {
      return NextResponse.json(
        { error: 'Farcaster認証に失敗しました' },
        { status: 401 },
      );
    }

    return NextResponse.json({ customToken }, { status: 200 });
  } catch (error) {
    console.error('[API] ❌ Farcaster Firebase token API error:', error);
    return NextResponse.json(
      {
        error: 'Farcaster Firebase認証トークンの取得に失敗しました',
        details: error instanceof Error ? error.message : '不明なエラー',
      },
      { status: 500 },
    );
  }
}

export async function OPTIONS() {
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization',
  );
  return response;
}
