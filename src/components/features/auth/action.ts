'use server';

import { getPrivyId } from '@/lib/auth';
import { isIdExists } from '@/repository/db/user/actions';

export async function checkUserExists(): Promise<boolean> {
  const id = await getPrivyId();
  console.log('checkUserExists: getPrivyId returned:', id);
  if (!id) {
    console.log('checkUserExists: no privy ID found');
    return false;
  }
  const exists = await isIdExists(id);
  console.log('checkUserExists: isIdExists returned:', exists);
  return exists;
}

/**
 * クライアントサイドでユーザーIDを指定してユーザー存在確認を行う
 * Farcaster Mini App環境でのCookie問題を回避
 */
export async function checkUserExistsByUserId(userId: string): Promise<boolean> {
  console.log('checkUserExistsByUserId: userId:', userId);
  if (!userId) {
    console.log('checkUserExistsByUserId: no userId provided');
    return false;
  }
  const exists = await isIdExists(userId);
  console.log('checkUserExistsByUserId: isIdExists returned:', exists);
  return exists;
}
