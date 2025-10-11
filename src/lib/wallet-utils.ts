/**
 * ウォレットアドレス関連のユーティリティ関数
 * @description クライアントサイドとサーバーサイド両方で使用可能
 */

/**
 * ウォレットアドレスを正規化する（小文字に統一）
 * @param walletAddress ウォレットアドレス
 * @returns 小文字に正規化されたウォレットアドレス
 * @description Ethereumアドレスは大文字小文字を区別しないため、常に小文字で統一する
 */
export function normalizeWalletAddress(walletAddress: string): string {
  return walletAddress.toLowerCase();
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
