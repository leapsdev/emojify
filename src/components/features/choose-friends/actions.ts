'use server';

import { addFriend, getUsersWithFriendship } from '@/repository/user/actions';
import type { User } from '@/types/database';

/**
 * 友達を追加するサーバーアクション
 */
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

/**
 * ユーザー一覧を取得するサーバーアクション
 * - 友達とその他のユーザーを分けて返す
 */
export async function getUsersWithFriendshipAction(userId: string): Promise<{
  success: boolean;
  friends?: User[];
  others?: User[];
  error?: string;
}> {
  try {
    const { friends, others } = await getUsersWithFriendship(userId);
    return {
      success: true,
      friends,
      others,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '不明なエラーが発生しました',
    };
  }
}
