import { adminDb } from '@/repository/db/config/server';
import type { User } from '@/repository/db/database';
import { DB_PATHS } from '@/repository/db/database';

/**
 * ウォレットアドレス関連のユーティリティ関数
 * @description サーバーサイドとクライアントサイド両方で使用可能
 */

/**
 * ウォレットアドレスからユーザー情報を取得する（サーバーサイド専用）
 * @param walletAddress ウォレットアドレス
 * @returns ユーザー情報（見つからない場合はnull）
 * @throws {Error} データベースエラー時（エラーはログに記録され、nullを返す）
 * @description 新しいスキーマではウォレットアドレスがユーザーIDと同じ
 */
export async function getUserFromWalletAddress(
  walletAddress: string,
): Promise<User | null> {
  try {
    const userSnapshot = await adminDb
      .ref(`${DB_PATHS.users}/${walletAddress}`)
      .get();
    return userSnapshot.val() as User | null;
  } catch (error) {
    console.error('Failed to get user from wallet address:', error);
    return null;
  }
}

/**
 * ウォレットアドレスが有効かどうかを検証する（クライアント・サーバー共通）
 * @param walletAddress ウォレットアドレス
 * @returns 有効な場合はtrue、無効な場合はfalse
 * @description Ethereumアドレスの基本的な形式チェック（0x + 40文字の16進数）
 */
export function isValidWalletAddress(walletAddress: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(walletAddress);
}
