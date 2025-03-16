'use server';

import { addFriend } from '@/repository/user/actions';

export async function addFriendAction(userId: string, friendId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await addFriend(userId, friendId);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました',
    };
  }
}
