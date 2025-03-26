'use client';

import { db } from '@/lib/firebase/client';
import type { ChatRoom } from '@/types/database';
import { DB_PATHS } from '@/types/database';
import { off, onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';

/**
 * ユーザーのチャットルーム一覧をリアルタイムで購読するhook
 */
export function useUserRooms(userId: string, initialRooms: ChatRoom[]) {
  const [rooms, setRooms] = useState<ChatRoom[]>(initialRooms);

  useEffect(() => {
    if (!userId) return;

    const userRoomsRef = ref(db, `${DB_PATHS.userRooms}/${userId}`);
    let messageRefs: ReturnType<typeof ref>[] = [];

    const unsubscribe = onValue(
      userRoomsRef,
      async (indexSnapshot) => {
        const snapshotVal = indexSnapshot.val();
        if (!snapshotVal) {
          setRooms([]);
          return;
        }

        // 既存のリスナーをクリーンアップ
        messageRefs.forEach((ref) => off(ref));
        messageRefs = [];

        // チャットルームの変更を監視
        Object.keys(snapshotVal).forEach((roomId) => {
          const roomRef = ref(db, `${DB_PATHS.chatRooms}/${roomId}`);
          messageRefs.push(roomRef);

          onValue(roomRef, (snapshot) => {
            const room = snapshot.val() as ChatRoom;
            if (room) {
              setRooms((prevRooms) => {
                const updatedRooms = prevRooms.filter((r) => r.id !== room.id);
                return [...updatedRooms, room].sort(
                  (a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0),
                );
              });
            }
          });
        });
      },
      () => setRooms([]),
    );

    return () => {
      messageRefs.forEach((ref) => off(ref));
      unsubscribe();
    };
  }, [userId]);

  return rooms;
}
