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
  try {
    if (!userId) {
      throw new Error('ユーザーIDが必要です');
    }

    // Firebase Admin SDKを使用してカスタムトークンを生成
    const customToken = await getAuth().createCustomToken(
      userId,
      customClaims || {},
    );

    return customToken;
  } catch (error) {
    console.error(
      '[Firebase Auth] ❌ Firebaseカスタムトークン生成エラー:',
      error,
    );

    // より詳細なエラー情報をログ出力
    if (error instanceof Error) {
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
