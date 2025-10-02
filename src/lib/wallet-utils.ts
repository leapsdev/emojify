import { adminDb } from '@/repository/db/config/server';
import type { User } from '@/repository/db/database';
import { DB_PATHS } from '@/repository/db/database';

/**
 * ウォレットアドレス関連のユーティリティ関数
 */

/**
 * ユーザーIDからウォレットアドレスを取得
 * @param userId ユーザーID
 * @returns ウォレットアドレス（取得できない場合はnull）
 */
export async function getWalletAddressFromUserId(
  userId: string,
): Promise<string | null> {
  try {
    const userSnapshot = await adminDb.ref(`${DB_PATHS.users}/${userId}`).get();
    const user = userSnapshot.val() as User | null;

    if (!user) {
      console.warn(`User not found: ${userId}`);
      return null;
    }

    // 新しいスキーマでは、idフィールドがウォレットアドレスを表す
    return userId;
  } catch (error) {
    console.error('Failed to get wallet address from user ID:', error);
    return null;
  }
}

/**
 * ウォレットアドレスからユーザー情報を取得
 * @param walletAddress ウォレットアドレス
 * @returns ユーザー情報（見つからない場合はnull）
 */
export async function getUserFromWalletAddress(
  walletAddress: string,
): Promise<User | null> {
  try {
    // ウォレットアドレスがユーザーIDと同じ場合の処理
    const userSnapshot = await adminDb
      .ref(`${DB_PATHS.users}/${walletAddress}`)
      .get();
    const user = userSnapshot.val() as User | null;

    if (user) {
      return user;
    }

    // ウォレットアドレスが異なる場合、全ユーザーを検索
    // 注意: この方法は非効率なので、本番環境では別のインデックスを作成することを推奨
    const usersSnapshot = await adminDb.ref(DB_PATHS.users).get();
    const users = usersSnapshot.val() as Record<string, User> | null;

    if (!users) {
      return null;
    }

    // ウォレットアドレスに一致するユーザーを検索
    for (const [userId, user] of Object.entries(users)) {
      // 現在の実装では、ユーザーIDがウォレットアドレスとして使用されている
      if (userId === walletAddress) {
        return user;
      }
    }

    return null;
  } catch (error) {
    console.error('Failed to get user from wallet address:', error);
    return null;
  }
}

/**
 * ウォレットアドレスが有効かどうかを検証
 * @param walletAddress ウォレットアドレス
 * @returns 有効な場合はtrue
 */
export function isValidWalletAddress(walletAddress: string): boolean {
  // Ethereumアドレスの基本的な検証
  return /^0x[a-fA-F0-9]{40}$/.test(walletAddress);
}

/**
 * ユーザーIDからウォレットアドレスを取得（同期版）
 * 注意: この関数は現在の実装ではユーザーIDをそのまま返す
 * @param userId ユーザーID
 * @returns ウォレットアドレス
 */
export function getWalletAddressFromUserIdSync(userId: string): string {
  // 現在の実装では、ユーザーIDがウォレットアドレスとして使用されている
  return userId;
}

/**
 * ウォレットアドレスからユーザーIDを取得（同期版）
 * 注意: この関数は現在の実装ではウォレットアドレスをそのまま返す
 * @param walletAddress ウォレットアドレス
 * @returns ユーザーID
 */
export function getUserIdFromWalletAddressSync(walletAddress: string): string {
  // 現在の実装では、ウォレットアドレスがユーザーIDとして使用されている
  return walletAddress;
}
