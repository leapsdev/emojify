import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { getWalletAddresses } from '@/repository/db/user/actions';

/**
 * クライアントサイドでユーザーIDを取得するためのカスタムフック
 * miniapp環境ではFarcaster認証、Web環境ではPrivy認証を使用
 * @returns ユーザーID
 */
export function usePrivyId() {
  const { userId } = useUnifiedAuth();
  return userId;
}

/**
 * 指定されたユーザーIDからウォレットアドレスを取得する関数
 * @param userId ユーザーID（miniapp環境ではFarcaster、Web環境ではPrivy）
 * @returns ウォレットアドレスの配列
 */
export async function getWalletAddressesByUserId(
  userId: string,
): Promise<string[]> {
  return getWalletAddresses(userId);
}
