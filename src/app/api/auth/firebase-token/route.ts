import { getFirebaseCustomToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log('Firebase token API called');
    
    // CORSヘッダーの設定
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

    // Firebaseカスタムトークンを取得
    console.log('Calling getFirebaseCustomToken...');
    const customToken = await getFirebaseCustomToken();
    console.log('getFirebaseCustomToken result:', customToken ? 'Token received' : 'No token');

    if (!customToken) {
      console.log('No custom token, returning 401');
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    console.log('Returning token successfully');
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
