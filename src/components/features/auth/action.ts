'use server';

import { isIdExists } from '@/repository/db/user/actions';

export async function checkUserExists(id: string): Promise<boolean> {
  console.log('[checkUserExists] 開始:', {
    id,
    timestamp: new Date().toISOString(),
  });

  if (!id) {
    console.log('[checkUserExists] IDが空です');
    return false;
  }

  try {
    const exists = await isIdExists(id);
    console.log('[checkUserExists] 完了:', { id, exists });
    return exists;
  } catch (error) {
    console.error('[checkUserExists] エラー:', {
      error,
      id,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });
    // エラーの場合は安全側に倒してfalseを返す
    return false;
  }
}
