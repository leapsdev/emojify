'use server';

import { createUser } from '@/repository/db/user/actions';

/**
 * Farcaster情報から自動的にユーザーを作成する
 * @param walletAddress ウォレットアドレス
 * @throws {Error} ユーザー作成に失敗した場合
 */
export async function autoCreateUserFromFarcaster(
  walletAddress: string,
): Promise<void> {
  if (!walletAddress) {
    console.error('❌ Wallet address is required');
    throw new Error('Wallet address is required');
  }

  try {
    // まず簡単なテストから開始

    // 一時的にFarcaster SDKの取得をスキップして、直接ユーザー作成をテスト

    const userData = {
      username: `user_${Date.now()}`, // 一時的なユーザー名
      bio: null,
      imageUrl: null,
    };

    await createUser(userData, walletAddress);

    return; // 成功時に明示的にreturn
  } catch (error) {
    console.error('Failed to auto-create user from Farcaster:', error);
    throw new Error(
      `Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
