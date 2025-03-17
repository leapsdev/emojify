import { getUser } from '@/repository/user/actions';
import { PrivyClient } from '@privy-io/server-auth';
import { cookies } from 'next/headers';

if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID || !process.env.PRIVY_APP_SECRET) {
  throw new Error('Privy環境変数が設定されていません');
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
    console.error('Privy認証エラー:', error);
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
    console.error('Privy認証エラー:', error);
    return null;
  }
}
