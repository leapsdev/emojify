import { db } from '@/lib/firebase/client';
import type { ChatRoom } from '@/types/database';
import { DB_PATHS } from '@/types/database';
import { get, off, onValue, ref } from 'firebase/database';

export function subscribeToUserRoomsAction(
  userId: string,
  onRooms: (rooms: ChatRoom[]) => void,
) {
  return subscribeToUserRooms(userId, onRooms);
}

/**
 * ユーザーのチャットルーム一覧をリアルタイムで購読
 */
export function subscribeToUserRooms(
  userId: string,
  onRooms: (rooms: ChatRoom[]) => void,
): () => void {
  if (!userId) return () => {};

  const userRoomsRef = ref(db, `${DB_PATHS.userRooms}/${userId}`);

  onValue(
    userRoomsRef,
    async (indexSnapshot) => {
      const snapshotVal = indexSnapshot.val();
      if (!snapshotVal) {
        onRooms([]);
        return;
      }

      const roomIds = Object.keys(snapshotVal);
      const roomPromises = roomIds.map(async (roomId) => {
        const snapshot = await get(ref(db, `${DB_PATHS.chatRooms}/${roomId}`));
        return snapshot.val();
      });

      const rooms = (await Promise.all(roomPromises))
        .filter((room): room is ChatRoom => room !== null)
        .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));

      onRooms(rooms);
    },
    () => onRooms([]),
  );

  return () => off(userRoomsRef);
}
