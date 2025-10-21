'use server';

import { isIdExists } from '@/repository/db/user/actions';

export async function checkUserExists(id: string): Promise<boolean> {
  if (!id) {
    return false;
  }

  try {
    const exists = await isIdExists(id);
    return exists;
  } catch (error) {
    console.error('[checkUserExists] Error:', {
      error,
      id,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });
    // エラーの場合は安全側に倒してfalseを返す
    return false;
  }
}
