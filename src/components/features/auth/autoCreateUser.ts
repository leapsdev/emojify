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
  console.log(
    '🚀 autoCreateUserFromFarcaster called with wallet:',
    walletAddress,
  );

  if (!walletAddress) {
    console.error('❌ Wallet address is required');
    throw new Error('Wallet address is required');
  }

  try {
    // まず簡単なテストから開始
    console.log('🧪 Testing basic server action functionality...');
    
    // 一時的にFarcaster SDKの取得をスキップして、直接ユーザー作成をテスト
    console.log('📝 Creating user with basic data...');
    
    const userData = {
      username: `user_${Date.now()}`, // 一時的なユーザー名
      bio: null,
      imageUrl: null,
    };

    console.log(
      '💾 Calling createUser with basic data:',
      JSON.stringify(userData, null, 2),
    );
    
    const result = await createUser(userData, walletAddress);
    console.log('✅ User auto-created successfully:', {
      walletAddress,
      result,
    });

    console.log('🎉 autoCreateUserFromFarcaster completed successfully');
    return; // 成功時に明示的にreturn
  } catch (error) {
    console.error('💥 Failed to auto-create user from Farcaster:', error);
    console.error('📊 Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
    });
    throw new Error(
      `Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
