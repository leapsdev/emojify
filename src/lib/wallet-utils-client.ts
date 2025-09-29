/**
 * クライアントサイド用のウォレットアドレス関連ユーティリティ関数
 */

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
