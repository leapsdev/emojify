'use server';

import { getFarcasterSDK } from '@/lib/farcaster';
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
    throw new Error('Wallet address is required');
  }

  try {
    // Farcaster SDKからユーザー情報を取得
    const sdk = getFarcasterSDK();
    if (!sdk) {
      throw new Error('Farcaster SDK is not available');
    }

    // Farcasterコンテキストからユーザー情報を取得
    const context = await sdk.context;
    const userContext = context?.user;

    if (!userContext) {
      throw new Error('Farcaster user context is not available');
    }

    // ユーザー名を取得（displayNameまたはusernameを優先）
    const username =
      userContext.displayName ||
      userContext.username ||
      `user_${userContext.fid}`;

    // プロフィール画像URLを取得
    const imageUrl = userContext.pfpUrl || null;

    // ユーザーを作成
    const userData = {
      username,
      bio: null, // 初期値はnull
      imageUrl,
    };

    await createUser(userData, walletAddress);
    console.log('User auto-created successfully:', {
      walletAddress,
      username,
      imageUrl,
    });
  } catch (error) {
    console.error('Failed to auto-create user from Farcaster:', error);
    throw new Error(
      `Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
