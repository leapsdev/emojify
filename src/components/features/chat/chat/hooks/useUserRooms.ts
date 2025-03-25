'use client';

import { db } from '@/lib/firebase/client';
import type { ChatRoom } from '@/types/database';
import { DB_PATHS } from '@/types/database';
import { off, onValue, ref } from 'firebase/database';
import { useSyncExternalStore } from 'react';

/**
 * ユーザーのチャットルーム一覧をリアルタイムで購読するhook
 */
export function useUserRooms(userId: string, initialRooms: ChatRoom[]) {
  return useSyncExternalStore(
    () => subscribe(userId),
    () => getSnapshot(userId) ?? initialRooms,
    () => initialRooms
  );
}

// チャットルームのスナップショットを保持するオブジェクト
const roomSnapshots: { [userId: string]: ChatRoom[] } = {};

function getSnapshot(userId: string): ChatRoom[] | undefined {
  return roomSnapshots[userId];
}

function subscribe(userId: string) {
  if (!userId) {
    return () => {};
  }

  const userRoomsRef = ref(db, `${DB_PATHS.userRooms}/${userId}`);
  const messageRefs: ReturnType<typeof ref>[] = [];

  // チャットルームの変更を監視
  const unsubscribe = onValue(
    userRoomsRef,
    async (indexSnapshot) => {
      const snapshotVal = indexSnapshot.val();
      if (!snapshotVal) {
        roomSnapshots[userId] = [];
        return;
      }

      // 既存のリスナーをクリーンアップ
      messageRefs.forEach((ref) => off(ref));
      messageRefs.length = 0;

      // チャットルームの変更を監視
      Object.keys(snapshotVal).forEach((roomId) => {
        const roomRef = ref(db, `${DB_PATHS.chatRooms}/${roomId}`);
        messageRefs.push(roomRef);

        onValue(roomRef, (snapshot) => {
          const room = snapshot.val() as ChatRoom;
          if (room) {
            const prevRooms = roomSnapshots[userId] || [];
            const updatedRooms = prevRooms.filter((r) => r.id !== room.id);
            roomSnapshots[userId] = [...updatedRooms, room].sort(
              (a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0)
            );
          }
        });
      });
    },
    () => {
      roomSnapshots[userId] = [];
    }
  );

  // クリーンアップ関数を返す
  return () => {
    messageRefs.forEach((ref) => off(ref));
    unsubscribe();
    delete roomSnapshots[userId];
  };
}
