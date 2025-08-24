'use server';

import { getPrivyId } from '@/lib/auth';
import { isIdExists } from '@/repository/db/user/actions';

export async function checkUserExists(): Promise<boolean> {
  const id = await getPrivyId();
  if (!id) return false;
  const exists = await isIdExists(id);
  return exists;
}

// クライアントサイド用の関数
export async function checkUserExistsClient(): Promise<boolean> {
  try {
    // クライアントサイドでは、localStorageやsessionStorageからユーザー情報を取得
    // または、APIエンドポイントを呼び出す
    const response = await fetch('/api/user/exists', {
      method: 'GET',
      credentials: 'include', // Cookieを含める
    });

    if (response.ok) {
      const data = await response.json();
      return data.exists;
    }

    return false;
  } catch (error) {
    console.error('Client-side user existence check failed:', error);
    return false;
  }
}
