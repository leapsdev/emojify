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
  console.log('[Privy Auth] 🚀 Starting Privy authentication process');

  try {
    if (!privyToken) {
      console.log('[Privy Auth] ❌ No Privy token provided');
      return null;
    }

    console.log('[Privy Auth] 🔑 Privy token received, verifying...');

    // トークンの検証
    const verifiedUser = await privy.verifyAuthToken(privyToken);
    if (!verifiedUser) {
      console.log('[Privy Auth] ❌ Privy token verification failed');
      return null;
    }

    console.log('[Privy Auth] ✅ Privy token verified successfully');

    const privyUserId = verifiedUser.userId;
    if (!privyUserId) {
      console.log('[Privy Auth] ❌ No user ID found in verified Privy token');
      return null;
    }

    console.log('[Privy Auth] 👤 User ID extracted:', privyUserId);
    console.log('[Privy Auth] 🔥 Generating Firebase custom token...');

    // Firebaseカスタムトークンを生成
    const customToken = await createFirebaseCustomToken(privyUserId, {
      privyUserId: privyUserId,
      authProvider: 'privy',
    });

    console.log('[Privy Auth] ✅ Firebase custom token generated successfully');
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
): Promise<string | null> {
  console.log('[Farcaster Auth] 🚀 Starting Farcaster authentication process');

  try {
    if (!farcasterToken) {
      console.log('[Farcaster Auth] ❌ No Farcaster token provided');
      return null;
    }

    console.log(
      '[Farcaster Auth] 🔑 Farcaster JWT received, initializing client...',
    );

    // Farcaster JWTを検証
    const { createClient } = await import('@farcaster/quick-auth');
    const client = createClient();

    const expectedDomain = process.env.NEXT_PUBLIC_DOMAIN || 'localhost:3000';
    console.log(
      '[Farcaster Auth] 🔍 Expected domain for verification:',
      expectedDomain,
    );

    console.log('[Farcaster Auth] 🔄 Verifying JWT...');
    const payload = await client.verifyJwt({
      token: farcasterToken,
      domain: expectedDomain,
    });

    if (!payload || !payload.sub) {
      console.log('[Farcaster Auth] ❌ JWT verification failed');
      return null;
    }
    console.log('[Farcaster Auth] ✅ JWT verified successfully');
    console.log('[Farcaster Auth] 🆔 FID extracted:', payload.sub);

    // ウォレットアドレスが提供されている場合はそれを使用、なければFIDを使用（フォールバック）
    const userId = walletAddress || String(payload.sub);
    console.log('[Farcaster Auth] 👤 User ID to use:', userId);
    console.log(
      '[Farcaster Auth] 📍 Source:',
      walletAddress ? 'Wallet Address' : 'FID (fallback)',
    );
    console.log('[Farcaster Auth] 🔥 Generating Firebase custom token...');

    // Firebaseカスタムトークンを生成
    const { createFirebaseCustomToken } = await import('./firebase-auth');
    const customToken = await createFirebaseCustomToken(userId, {
      farcasterFid: payload.sub,
      authProvider: 'farcaster',
      ...(walletAddress && { walletAddress }),
    });

    console.log(
      '[Farcaster Auth] ✅ Firebase custom token generated successfully',
    );
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
