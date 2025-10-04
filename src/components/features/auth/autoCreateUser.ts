'use server';

import { createUser } from '@/repository/db/user/actions';
import type { ProfileForm } from '@/repository/db/user/schema';

/**
 * Farcaster情報から自動的にユーザーを作成する
 * @param userData ユーザー情報

 * @throws {Error} ユーザー作成に失敗した場合
 */
export async function autoCreateUserFromFarcaster(
  userData: ProfileForm,
): Promise<void> {
  if (!userData.id) {
    console.error('❌ Wallet address is required');
    throw new Error('Wallet address is required');
  }

  try {
    await createUser(userData, userData.id);
  } catch (error) {
    console.error('Failed to auto-create user from Farcaster:', error);
    throw new Error(
      `Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
