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
 * PrivyユーザーIDを使用してFirebaseカスタムトークンを生成する
 * @param privyUserId PrivyユーザーID
 * @returns Firebaseカスタムトークン
 */
export async function createFirebaseCustomToken(
  privyUserId: string,
): Promise<string> {
  try {
    if (!privyUserId) {
      throw new Error('PrivyユーザーIDが必要です');
    }

    // Firebase Admin SDKを使用してカスタムトークンを生成
    const customToken = await getAuth().createCustomToken(privyUserId, {
      privyUserId: privyUserId,
    });

    return customToken;
  } catch (error) {
    console.error('Firebaseカスタムトークン生成エラー:', error);
    throw new Error('Firebase認証トークンの生成に失敗しました');
  }
}

/**
 * FarcasterユーザーIDを使用してFirebaseカスタムトークンを生成する
 * @param farcasterUserId FarcasterユーザーID（farcaster_プレフィックス付き）
 * @param customClaims カスタムクレーム（FIDやauthProviderなど）
 * @returns Firebaseカスタムトークン
 */
export async function createFirebaseCustomTokenForFarcaster(
  farcasterUserId: string,
  customClaims?: {
    farcasterFid?: number;
    authProvider?: string;
  },
): Promise<string> {
  try {
    if (!farcasterUserId) {
      throw new Error('FarcasterユーザーIDが必要です');
    }

    // Firebase Admin SDKを使用してカスタムトークンを生成
    const customToken = await getAuth().createCustomToken(farcasterUserId, {
      farcasterUserId: farcasterUserId,
      ...customClaims,
    });

    return customToken;
  } catch (error) {
    console.error('Farcaster Firebaseカスタムトークン生成エラー:', error);
    throw new Error('Farcaster Firebase認証トークンの生成に失敗しました');
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
