import { getFirebaseCustomToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // CORSヘッダーの設定
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

    // Firebaseカスタムトークンを取得
    const customToken = await getFirebaseCustomToken();

    if (!customToken) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    return NextResponse.json({ token: customToken }, { status: 200 });
  } catch (error) {
    console.error('Firebase token API error:', error);
    return NextResponse.json({ error: '内部サーバーエラー' }, { status: 500 });
  }
}

export async function OPTIONS() {
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}
