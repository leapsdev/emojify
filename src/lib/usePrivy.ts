import { getWalletAddresses } from '@/repository/db/user/actions';
// import { usePrivy } from '@privy-io/react-auth'; // 一時的にコメントアウト

/**
 * クライアントサイドでPrivyのユーザーIDを取得するためのカスタムフック
 * @returns ユーザーID
 */
export function usePrivyId() {
  // const { user } = usePrivy(); // 一時的にコメントアウト
  return 'temp_user_id'; // 一時的に固定値を返す
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
