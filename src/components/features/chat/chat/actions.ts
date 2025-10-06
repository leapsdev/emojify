'use server';

import { adminDbRef } from '@/repository/db/config/server';
import type { ChatRoom } from '@/repository/db/database';
import { DB_INDEXES, DB_PATHS } from '@/repository/db/database';

/**
 * ユーザーのチャットルーム一覧を取得
 */
export async function getUserRooms(walletAddress: string): Promise<ChatRoom[]> {
  if (!walletAddress) return [];

  const userRoomsRef = adminDbRef(`${DB_INDEXES.userRooms}/${walletAddress}`);
  const indexSnapshot = await userRoomsRef.get();
  const snapshotVal = indexSnapshot.val();

  if (!snapshotVal) return [];

  const roomIds = Object.keys(snapshotVal);
  const roomPromises = roomIds.map(async (roomId) => {
    const snapshot = await adminDbRef(`${DB_PATHS.chatRooms}/${roomId}`).get();
    return snapshot.val();
  });

  const rooms = (await Promise.all(roomPromises))
    .filter((room): room is ChatRoom => room !== null)
    .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));

  return rooms;
}
