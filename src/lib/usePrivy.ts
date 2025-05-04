import { getWalletAddresses } from '@/repository/user/actions';
import { usePrivy } from '@privy-io/react-auth';

/**
 * クライアントサイドでPrivyのユーザーIDを取得するためのカスタムフック
 * @returns ユーザーID
 */
export function usePrivyId() {
  const { user } = usePrivy();
  return user?.id;
}

/**
 * 指定されたユーザーIDからウォレットアドレスを取得する関数
 * @param userId PrivyのユーザーID
 * @returns ウォレットアドレスの配列
 */
export async function getWalletAddressesByUserId(
  userId: string,
): Promise<string[]> {
  return getWalletAddresses(userId);
}
