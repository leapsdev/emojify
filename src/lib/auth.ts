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
 * Farcasterのminiapp環境かどうかを判定する
 * @returns miniapp環境の場合true
 */
async function isFarcasterMiniApp(): Promise<boolean> {
  try {
    // User-Agentヘッダーからminiapp環境を検出
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';
    const referer = headersList.get('referer') || '';

    // Farcaster関連のヘッダーやUser-Agentをチェック
    return (
      userAgent.includes('Farcaster') ||
      userAgent.includes('miniapp') ||
      referer.includes('farcaster.xyz') ||
      referer.includes('warpcast.com') ||
      // カスタムヘッダーでminiapp環境を検出
      (headersList.get('x-farcaster-miniapp')?.includes('true') ?? false)
    );
  } catch {
    // ヘッダー取得に失敗した場合はfalseを返す
    return false;
  }
}

/**
 * miniapp環境でのCookie取得を試行する
 * @returns Privyトークン
 */
async function getPrivyTokenForMiniApp(): Promise<string | null> {
  try {
    const headersList = await headers();

    // 1. カスタムヘッダーからトークンを取得（miniapp環境用）
    const customToken = headersList.get('x-privy-token');
    if (customToken) {
      return customToken;
    }

    // 2. Authorizationヘッダーからトークンを取得
    const authHeader = headersList.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // 3. クエリパラメータからトークンを取得（miniapp環境用）
    const xUrl = headersList.get('x-url');
    if (xUrl) {
      try {
        const url = new URL(xUrl);
        const queryToken = url.searchParams.get('privy_token');
        if (queryToken) {
          return queryToken;
        }
      } catch (urlError) {
        console.warn('Invalid URL in x-url header:', urlError);
      }
    }

    return null;
  } catch (error) {
    console.error('MiniApp token extraction error:', error);
    return null;
  }
}

/**
 * ユーザーIDを取得する
 * @returns ユーザーID
 * @throws {Error} 認証エラー時
 */
export async function getPrivyId(): Promise<string | null> {
  try {
    let privyToken: string | null = null;

    // miniapp環境の場合は専用の方法でトークンを取得
    if (await isFarcasterMiniApp()) {
      privyToken = await getPrivyTokenForMiniApp();
    }

    // miniapp環境でトークンが取得できない場合、または通常環境の場合はCookieから取得
    if (!privyToken) {
      try {
        const requestCookies = await cookies();
        const cookieValue = requestCookies.get('privy-token')?.value;
        privyToken = cookieValue || null;
      } catch (cookieError) {
        console.warn(
          'Cookie access failed, trying alternative methods:',
          cookieError,
        );
        // Cookieアクセスに失敗した場合、miniapp環境用の方法を試行
        privyToken = await getPrivyTokenForMiniApp();
      }
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
  privyToken: string,
): Promise<string | null> {
  try {
    if (!privyToken) {
      return null;
    }

    // トークンの検証
    const verifiedUser = await privy.verifyAuthToken(privyToken);
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
    let privyToken: string | null = null;

    // miniapp環境の場合は専用の方法でトークンを取得
    if (await isFarcasterMiniApp()) {
      privyToken = await getPrivyTokenForMiniApp();
    }

    // miniapp環境でトークンが取得できない場合、または通常環境の場合はCookieから取得
    if (!privyToken) {
      try {
        const requestCookies = await cookies();
        const cookieValue = requestCookies.get('privy-token')?.value;
        privyToken = cookieValue || null;
      } catch (cookieError) {
        console.warn(
          'Cookie access failed, trying alternative methods:',
          cookieError,
        );
        // Cookieアクセスに失敗した場合、miniapp環境用の方法を試行
        privyToken = await getPrivyTokenForMiniApp();
      }
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
