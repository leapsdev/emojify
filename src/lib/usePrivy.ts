import { usePrivy } from '@privy-io/react-auth';

/**
 * クライアントサイドでPrivyのユーザーIDを取得するためのカスタムフック
 * @returns ユーザーID
 */
export function usePrivyId() {
  const { user } = usePrivy();
  return user?.id;
}
