import { getFirebaseCustomToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    console.log('Firebase token API called');

    // AuthorizationヘッダーからPrivyトークンを取得
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No authorization header or invalid format');
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const privyToken = authHeader.replace('Bearer ', '');
    if (!privyToken) {
      console.log('No privy token in authorization header');
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // Firebaseカスタムトークンを取得
    console.log('Calling getFirebaseCustomToken with token...');
    const customToken = await getFirebaseCustomToken(privyToken);
    console.log(
      'getFirebaseCustomToken result:',
      customToken ? 'Token received' : 'No token',
    );

    if (!customToken) {
      console.log('No custom token, returning 401');
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    console.log('Returning token successfully');
    return NextResponse.json({ token: customToken }, { status: 200 });
  } catch (error) {
    console.error('Firebase token API error:', error);
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
