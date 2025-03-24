'use client';

import { db } from '@/lib/firebase/client';
import type { ChatRoom } from '@/types/database';
import { DB_PATHS } from '@/types/database';
import { get, off, onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';

/**
 * ユーザーのチャットルーム一覧をリアルタイムで購読するhook
 */
export function useUserRooms(userId: string) {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);

  useEffect(() => {
    if (!userId) return;

    const userRoomsRef = ref(db, `${DB_PATHS.userRooms}/${userId}`);

    const unsubscribe = onValue(
      userRoomsRef,
      async (indexSnapshot) => {
        const snapshotVal = indexSnapshot.val();
        if (!snapshotVal) {
          setRooms([]);
          return;
        }

        const roomIds = Object.keys(snapshotVal);
        const roomPromises = roomIds.map(async (roomId) => {
          const snapshot = await get(
            ref(db, `${DB_PATHS.chatRooms}/${roomId}`),
          );
          return snapshot.val();
        });

        const fetchedRooms = (await Promise.all(roomPromises))
          .filter((room): room is ChatRoom => room !== null)
          .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));

        setRooms(fetchedRooms);
      },
      () => setRooms([]),
    );

    return () => {
      off(userRoomsRef);
      unsubscribe();
    };
  }, [userId]);

  return rooms;
}
