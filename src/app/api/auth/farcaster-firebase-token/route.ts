import { getFirebaseCustomTokenFromFarcaster } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // リクエストボディからウォレットアドレスとダミーアカウントフラグを取得
    const body = await request.json().catch(() => ({}));
    const walletAddress = body.walletAddress as string | undefined;
    const isDummyAccount = body.isDummyAccount as boolean | undefined;
    const fid = body.fid as number | undefined;

    // ダミーアカウント（FID: -1）の場合の特別処理
    if (isDummyAccount && fid === -1 && walletAddress) {
      console.log(
        '[API] 🔍 Processing dummy Farcaster account with wallet:',
        walletAddress,
      );

      const customToken = await getFirebaseCustomTokenFromFarcaster(
        '', // 空のトークン
        walletAddress,
        true, // isDummyAccount
      );

      if (!customToken) {
        return NextResponse.json(
          { error: 'Failed to generate Firebase token for dummy account' },
          { status: 500 },
        );
      }

      return NextResponse.json({ customToken }, { status: 200 });
    }

    // AuthorizationヘッダーからFarcaster JWTを取得
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const farcasterToken = authHeader.replace('Bearer ', '');
    if (!farcasterToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    // Firebaseカスタムトークンを取得
    const customToken = await getFirebaseCustomTokenFromFarcaster(
      farcasterToken,
      walletAddress,
    );

    if (!customToken) {
      return NextResponse.json(
        { error: 'Farcaster authentication failed' },
        { status: 401 },
      );
    }

    return NextResponse.json({ customToken }, { status: 200 });
  } catch (error) {
    console.error('[API] ❌ Farcaster Firebase token API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to get Farcaster Firebase authentication token',
        details: error instanceof Error ? error.message : 'Unknown error',
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
