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
    console.error(
      '[Privy Auth] ❌ Firebase custom token generation error:',
      error,
    );
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
  walletAddress?: string,
  isDummyAccount?: boolean,
): Promise<string | null> {
  try {
    // ダミーアカウント（FID: -1）の場合、JWT検証をスキップ
    if (isDummyAccount && walletAddress) {
      console.log(
        '[Farcaster Auth] 🔍 Processing dummy account with wallet:',
        walletAddress,
      );

      const { createFirebaseCustomToken } = await import('./firebase-auth');
      const customToken = await createFirebaseCustomToken(walletAddress, {
        farcasterFid: -1,
        authProvider: 'farcaster',
        walletAddress,
        isDummyAccount: true,
      });

      return customToken;
    }

    if (!farcasterToken) {
      return null;
    }

    // Farcaster JWTを検証
    const { createClient } = await import('@farcaster/quick-auth');
    const client = createClient();

    // Farcaster configから設定されたドメインを取得
    // accountAssociation.payloadをデコードしてドメインを取得
    const { getFarcasterConfig } = await import('@/config/farcaster.config');
    const farcasterConfig = getFarcasterConfig();
    const payloadJson = JSON.parse(
      Buffer.from(
        farcasterConfig.accountAssociation.payload,
        'base64',
      ).toString('utf-8'),
    );
    const expectedDomain =
      payloadJson.domain || process.env.NEXT_PUBLIC_DOMAIN || 'localhost:3000';

    const payload = await client.verifyJwt({
      token: farcasterToken,
      domain: expectedDomain,
    });

    if (!payload || !payload.sub) {
      return null;
    }

    // ウォレットアドレスが提供されている場合はそれを使用、なければFIDを使用（フォールバック）
    const userId = walletAddress || String(payload.sub);

    // Firebaseカスタムトークンを生成
    const { createFirebaseCustomToken } = await import('./firebase-auth');
    const customToken = await createFirebaseCustomToken(userId, {
      farcasterFid: payload.sub,
      authProvider: 'farcaster',
      ...(walletAddress && { walletAddress }),
    });

    return customToken;
  } catch (error) {
    console.error(
      '[Farcaster Auth] ❌ Farcaster Firebase custom token generation error:',
      error,
    );
    return null;
  }
}

/**
 * ユーザーのメールアドレスを取得する
 * @returns メールアドレス（新しいスキーマでは常にnull）
 * @throws {Error} 認証エラー時
 */
export async function getPrivyEmail(): Promise<string | null> {
  // 新しいスキーマではemailフィールドが存在しないため、常にnullを返す
  return null;
}
