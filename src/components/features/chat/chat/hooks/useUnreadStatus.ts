'use client';

import { db } from '@/repository/db/config/client';
import type { ChatRoom } from '@/repository/db/database';
import { DB_PATHS } from '@/repository/db/database';
import { onValue, ref } from 'firebase/database';
import { useCallback, useRef, useSyncExternalStore } from 'react';

export function useUnreadStatus(roomId: string, currentUserId: string) {
  const unreadStatusRef = useRef<boolean>(false);
  const membersRef = useRef<Record<string, { imageUrl?: string | null }>>({});

  const getSnapshot = useCallback(() => {
    return unreadStatusRef.current;
  }, []);

  const subscribe = useCallback(
    (callback: () => void) => {
      const roomRef = ref(db, `${DB_PATHS.chatRooms}/${roomId}`);

      const unsubscribe = onValue(roomRef, (snapshot) => {
        const room = snapshot.val() as ChatRoom;
        if (!room) {
          unreadStatusRef.current = false;
          membersRef.current = {};
          callback();
          return;
        }

        // メンバー情報の変更を検知
        const membersChanged =
          JSON.stringify(membersRef.current) !== JSON.stringify(room.members);
        if (membersChanged) {
          membersRef.current = room.members;
        }

        // 未読状態の更新
        const newUnreadStatus = room.lastMessage
          ? room.lastMessage.senderId !== currentUserId &&
            room.members[currentUserId].lastReadAt < room.lastMessage.createdAt
          : false;

        // 未読状態またはメンバー情報が変更された場合のみコールバックを呼び出す
        if (unreadStatusRef.current !== newUnreadStatus || membersChanged) {
          unreadStatusRef.current = newUnreadStatus;
          callback();
        }
      });

      return () => {
        unsubscribe();
        unreadStatusRef.current = false;
        membersRef.current = {};
      };
    },
    [roomId, currentUserId],
  );

  const getServerSnapshot = useCallback(() => {
    return false;
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
