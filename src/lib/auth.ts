import { getUser } from '@/repository/db/user/actions';
import { PrivyClient } from '@privy-io/server-auth';
import { cookies } from 'next/headers';
import { headers } from 'next/headers';
import { createFirebaseCustomToken } from './firebase-auth';

if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID || !process.env.PRIVY_APP_SECRET) {
  throw new Error('Privy environment variables are not set');
}

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID,
  process.env.PRIVY_APP_SECRET,
);

/**
 * ユーザーIDを取得する
 * @returns ユーザーID
 * @throws {Error} 認証エラー時
 */
export async function getPrivyId(): Promise<string | null> {
  try {
    // AuthorizationヘッダーまたはCookieからトークンを取得
    const requestHeaders = await headers();
    const authHeader = requestHeaders.get('authorization');
    let privyToken: string | undefined;

    if (authHeader?.startsWith('Bearer ')) {
      privyToken = authHeader.slice(7);
    } else {
      // フォールバック: Cookieからトークンを取得
      const requestCookies = await cookies();
      privyToken = requestCookies.get('privy-token')?.value;
    }

    if (!privyToken) {
      return null;
    }

    // トークンの検証
    const verifiedUser = await privy.verifyAuthToken(privyToken);
    return verifiedUser ? verifiedUser.userId : null;
  } catch (error) {
    console.error('Privy authentication error:', error);
    return null;
  }
}

/**
 * ユーザーIDを取得する（エイリアス）
 */
export const getUserId = getPrivyId;

/**
 * Privyトークンを使用してFirebaseカスタムトークンを取得する
 * @param privyToken Privy認証トークン
 * @returns Firebaseカスタムトークン
 * @throws {Error} 認証エラー時
 */
export async function getFirebaseCustomToken(
  privyToken?: string,
): Promise<string | null> {
  try {
    let token = privyToken;

    if (!token) {
      // トークンが提供されていない場合、ヘッダーまたはCookieから取得
      const requestHeaders = await headers();
      const authHeader = requestHeaders.get('authorization');

      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.slice(7);
      } else {
        const requestCookies = await cookies();
        token = requestCookies.get('privy-token')?.value;
      }
    }

    if (!token) {
      return null;
    }

    // トークンの検証
    const verifiedUser = await privy.verifyAuthToken(token);
    if (!verifiedUser) {
      return null;
    }

    const privyUserId = verifiedUser.userId;
    if (!privyUserId) {
      return null;
    }

    // Firebaseカスタムトークンを生成
    const customToken = await createFirebaseCustomToken(privyUserId);
    return customToken;
  } catch (error) {
    console.error('Firebase custom token generation error:', error);
    return null;
  }
}

/**
 * ユーザーのメールアドレスを取得する
 * @returns メールアドレス
 * @throws {Error} 認証エラー時
 */
export async function getPrivyEmail(): Promise<string | null> {
  try {
    // AuthorizationヘッダーまたはCookieからトークンを取得
    const requestHeaders = await headers();
    const authHeader = requestHeaders.get('authorization');
    let privyToken: string | undefined;

    if (authHeader?.startsWith('Bearer ')) {
      privyToken = authHeader.slice(7);
    } else {
      // フォールバック: Cookieからトークンを取得
      const requestCookies = await cookies();
      privyToken = requestCookies.get('privy-token')?.value;
    }

    if (!privyToken) {
      return null;
    }

    // トークンの検証とユーザー情報の取得
    const verifiedUser = await privy.verifyAuthToken(privyToken);
    if (!verifiedUser) return null;

    const user = await getUser(verifiedUser.userId);
    return user?.email ?? null;
  } catch (error) {
    console.error('Privy authentication error:', error);
    return null;
  }
}
