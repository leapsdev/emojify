import { getFirebaseCustomTokenFromPrivy } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // AuthorizationヘッダーからPrivyトークンを取得
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const privyToken = authHeader.replace('Bearer ', '');
    if (!privyToken) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // Firebaseカスタムトークンを取得
    const customToken = await getFirebaseCustomTokenFromPrivy(privyToken);

    if (!customToken) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    return NextResponse.json({ token: customToken }, { status: 200 });
  } catch (error) {
    console.error('[API] ❌ Privy Firebase token API error:', error);
    return NextResponse.json(
      {
        error: 'Firebaseトークンの取得に失敗しました',
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
