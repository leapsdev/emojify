'use server';

import { createChatRoom } from '@/repository/chat/actions';
import { addFriend, getUsersWithFriendship } from '@/repository/user/actions';

/**
 * フレンドを追加
 */
export async function addFriendAction(userId: string, friendId: string) {
  try {
    await addFriend(userId, friendId);
    return { success: true };
  } catch (error) {
    console.error('Failed to add friend:', error);
    return { success: false, error: 'Failed to add friend' };
  }
}

/**
 * チャットルームを作成
 */
export async function createChatRoomAction(members: string[]) {
  try {
    const roomId = await createChatRoom(members);
    return { success: true, roomId };
  } catch (error) {
    console.error('Failed to create chat room:', error);
    return { success: false, error: 'Failed to create chat room' };
  }
}

/**
 * ユーザー一覧を取得
 */
export async function getUsersWithFriendshipAction(currentUserId: string) {
  try {
    return await getUsersWithFriendship(currentUserId);
  } catch (error) {
    console.error('Failed to get users:', error);
    return { friends: [], others: [] };
  }
}
