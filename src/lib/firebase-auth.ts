import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// 環境変数のバリデーション
if (!process.env.FIREBASE_ADMIN_PROJECT_ID) {
  throw new Error('FIREBASE_ADMIN_PROJECT_ID environment variable is not set');
}
if (!process.env.FIREBASE_ADMIN_CLIENT_EMAIL) {
  throw new Error('FIREBASE_ADMIN_CLIENT_EMAIL environment variable is not set');
}
if (!process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
  throw new Error('FIREBASE_ADMIN_PRIVATE_KEY environment variable is not set');
}

// Firebase Admin SDKの初期化
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID, // 明示的にprojectIdを指定
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    });
    console.log(
      '[Firebase Auth] ✅ Firebase Admin SDK initialized successfully for project:',
      process.env.FIREBASE_ADMIN_PROJECT_ID,
    );
  } catch (error) {
    console.error('[Firebase Auth] ❌ Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
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
      throw new Error('User ID is required');
    }

    // Firebase Admin SDKを使用してカスタムトークンを生成
    const customToken = await getAuth().createCustomToken(
      userId,
      customClaims || {},
    );

    console.log(
      '[Firebase Auth] ✅ Custom token generated successfully for user:',
      userId,
    );

    return customToken;
  } catch (error) {
    console.error(
      '[Firebase Auth] ❌ Firebaseカスタムトークン生成エラー:',
      error,
    );

    // より詳細なエラー情報をログ出力
    if (error instanceof Error) {
      console.error('[Firebase Auth] ❌ Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        userId,
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      });
    }

    throw error; // 元のエラーをそのままスロー
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
    console.error('Firebase token verification error:', error);
    throw new Error('Failed to verify Firebase authentication token');
  }
}
