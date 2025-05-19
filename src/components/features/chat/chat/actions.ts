'use server';

import { db } from '@/repository/db/config/client';
import type { ChatRoom } from '@/repository/db/database';
import { DB_PATHS } from '@/repository/db/database';
import { get, ref } from 'firebase/database';

/**
 * ユーザーのチャットルーム一覧を取得
 */
export async function getUserRooms(userId: string): Promise<ChatRoom[]> {
  if (!userId) return [];

  const userRoomsRef = ref(db, `${DB_PATHS.userRooms}/${userId}`);
  const indexSnapshot = await get(userRoomsRef);
  const snapshotVal = indexSnapshot.val();

  if (!snapshotVal) return [];

  const roomIds = Object.keys(snapshotVal);
  const roomPromises = roomIds.map(async (roomId) => {
    const snapshot = await get(ref(db, `${DB_PATHS.chatRooms}/${roomId}`));
    return snapshot.val();
  });

  const rooms = (await Promise.all(roomPromises))
    .filter((room): room is ChatRoom => room !== null)
    .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));

  return rooms;
}
