import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Firebase Admin SDKの初期化
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  });
}

/**
 * ユーザーIDを使用してFirebaseカスタムトークンを生成する
 * @param userId ユーザーID
 * @param customClaims カスタムクレーム（認証プロバイダー情報など）
 * @returns Firebaseカスタムトークン
 */
export async function createFirebaseCustomToken(
  userId: string,
  customClaims?: Record<string, unknown>,
): Promise<string> {
  console.log('[Firebase Auth] 🚀 Starting Firebase custom token generation');
  console.log('[Firebase Auth] 👤 User ID:', userId);
  console.log('[Firebase Auth] 📝 Custom claims:', customClaims);

  try {
    if (!userId) {
      console.log('[Firebase Auth] ❌ No user ID provided');
      throw new Error('ユーザーIDが必要です');
    }

    const authProvider = customClaims?.authProvider as string;
    console.log('[Firebase Auth] 🔐 Auth provider:', authProvider);

    // Firebase Admin SDKを使用してカスタムトークンを生成
    console.log('[Firebase Auth] 🔥 Creating custom token with Firebase Admin SDK...');
    const customToken = await getAuth().createCustomToken(
      userId,
      customClaims || {},
    );

    console.log('[Firebase Auth] ✅ Firebase custom token created successfully');
    console.log('[Firebase Auth] 🎫 Token length:', customToken.length);

    return customToken;
  } catch (error) {
    console.error('[Firebase Auth] ❌ Firebaseカスタムトークン生成エラー:', error);

    // より詳細なエラー情報をログ出力
    if (error instanceof Error) {
      console.error('[Firebase Auth] ❌ Error name:', error.name);
      console.error('[Firebase Auth] ❌ Error message:', error.message);
      console.error('[Firebase Auth] ❌ Error stack:', error.stack);
    }

    throw new Error('Firebase認証トークンの生成に失敗しました');
  }
}

/**
 * Firebaseカスタムトークンを検証する
 * @param customToken Firebaseカスタムトークン
 * @returns 検証されたユーザーID
 */
export async function verifyFirebaseCustomToken(
  customToken: string,
): Promise<string> {
  try {
    const decodedToken = await getAuth().verifyIdToken(customToken);
    return decodedToken.uid;
  } catch (error) {
    console.error('Firebaseトークン検証エラー:', error);
    throw new Error('Firebase認証トークンの検証に失敗しました');
  }
}
