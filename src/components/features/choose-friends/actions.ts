'use server';

import {
  createChatRoom,
  findChatRoomByMembers,
} from '@/repository/chat/actions';
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
 * @returns 既存のルームが存在する場合はそのルームID、新規作成の場合はnull
 */
export async function createChatRoomAction(members: string[]) {
  try {
    // 1対1のチャットルームの場合のみ既存のルームを確認
    if (members.length === 2) {
      const existingRoom = await findChatRoomByMembers(members);
      if (existingRoom) {
        return { success: true, roomId: existingRoom.id, isExisting: true };
      }
    }

    // 1対1以外のチャットルーム、または既存のルームが存在しない場合は新規作成
    const roomId = await createChatRoom(members);
    return { success: true, roomId, isExisting: false };
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
