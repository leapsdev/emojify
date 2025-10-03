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
  console.log('autoCreateUserFromFarcaster called with wallet:', walletAddress);
  
  if (!walletAddress) {
    console.error('Wallet address is required');
    throw new Error('Wallet address is required');
  }

  try {
    console.log('Getting Farcaster SDK...');
    // Farcaster SDKからユーザー情報を取得
    const sdk = getFarcasterSDK();
    if (!sdk) {
      console.error('Farcaster SDK is not available');
      throw new Error('Farcaster SDK is not available');
    }
    console.log('Farcaster SDK obtained successfully');

    console.log('Getting Farcaster context...');
    // Farcasterコンテキストからユーザー情報を取得
    const context = await sdk.context;
    console.log('Farcaster context obtained:', context);
    
    const userContext = context?.user;
    console.log('Farcaster user context:', userContext);

    if (!userContext) {
      console.error('Farcaster user context is not available');
      throw new Error('Farcaster user context is not available');
    }

    // ユーザー名を取得（displayNameまたはusernameを優先）
    const username =
      userContext.displayName ||
      userContext.username ||
      `user_${userContext.fid}`;

    // プロフィール画像URLを取得
    const imageUrl = userContext.pfpUrl || null;

    console.log('Prepared user data:', { username, imageUrl, walletAddress });

    // ユーザーを作成
    const userData = {
      username,
      bio: null, // 初期値はnull
      imageUrl,
    };

    console.log('Calling createUser with data:', userData);
    await createUser(userData, walletAddress);
    console.log('User auto-created successfully:', {
      walletAddress,
      username,
      imageUrl,
    });
    
    return; // 成功時に明示的にreturn
  } catch (error) {
    console.error('Failed to auto-create user from Farcaster:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    throw new Error(
      `Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
