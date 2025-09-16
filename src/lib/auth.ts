import { getUser } from '@/repository/db/user/actions';
import { PrivyClient } from '@privy-io/server-auth';
import { cookies } from 'next/headers';
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
    // Cookieからトークンを取得
    const requestCookies = await cookies();
    const privyToken = requestCookies.get('privy-token')?.value;

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
 * Privyトークンを使用してFirebaseカスタムトークンを取得する
 * @param privyToken Privy認証トークン
 * @returns Firebaseカスタムトークン
 * @throws {Error} 認証エラー時
 */
export async function getFirebaseCustomTokenFromPrivy(
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
    const customToken = await createFirebaseCustomToken(privyUserId, {
      privyUserId: privyUserId,
      authProvider: 'privy',
    });
    return customToken;
  } catch (error) {
    console.error('Firebase custom token generation error:', error);
    return null;
  }
}

/**
 * Farcaster JWTを使用してFirebaseカスタムトークンを取得する
 * @param farcasterToken Farcaster JWT
 * @returns Firebaseカスタムトークン
 */
export async function getFirebaseCustomTokenFromFarcaster(
  farcasterToken: string,
): Promise<string | null> {
  try {
    if (!farcasterToken) {
      return null;
    }

    // Farcaster JWTを検証
    const { createClient } = await import('@farcaster/quick-auth');
    const client = createClient();

    const payload = await client.verifyJwt({
      token: farcasterToken,
      domain: process.env.NEXT_PUBLIC_DOMAIN || 'localhost:3000',
    });

    if (!payload || !payload.sub) {
      return null;
    }

    // FIDをユーザーIDとして使用（プレフィックス付き）
    const farcasterUserId = `farcaster_${payload.sub}`;

    // Firebaseカスタムトークンを生成
    const { createFirebaseCustomToken } = await import('./firebase-auth');
    const customToken = await createFirebaseCustomToken(farcasterUserId, {
      farcasterUserId: farcasterUserId,
      farcasterFid: payload.sub,
      authProvider: 'farcaster',
    });

    return customToken;
  } catch (error) {
    console.error('Farcaster Firebase custom token generation error:', error);
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
    // Cookieからトークンを取得
    const requestCookies = await cookies();
    const privyToken = requestCookies.get('privy-token')?.value;

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
