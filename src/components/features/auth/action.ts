'use server';

import { isIdExists } from '@/repository/db/user/actions';

export async function checkUserExists(id: string): Promise<boolean> {
  if (!id) {
    console.log('checkUserExists: No ID provided');
    return false;
  }

  try {
    const exists = await isIdExists(id);
    console.log(`checkUserExists: User ${id} exists: ${exists}`);
    return exists;
  } catch (error) {
    console.error('checkUserExists: Error checking user existence:', error);
    // エラーの場合は安全側に倒してfalseを返す
    return false;
  }
}
