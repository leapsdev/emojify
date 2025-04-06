'use client';

import { db } from '@/lib/firebase/client';
import type { ChatRoom } from '@/types/database';
import { DB_PATHS } from '@/types/database';
import { onValue, ref } from 'firebase/database';
import { useCallback, useRef, useSyncExternalStore } from 'react';

export function useUnreadStatus(roomId: string, currentUserId: string) {
  const unreadStatusRef = useRef<boolean>(false);

  const getSnapshot = useCallback(() => {
    return unreadStatusRef.current;
  }, []);

  const subscribe = useCallback(
    (callback: () => void) => {
      const roomRef = ref(db, `${DB_PATHS.chatRooms}/${roomId}`);

      const unsubscribe = onValue(roomRef, (snapshot) => {
        const room = snapshot.val() as ChatRoom;
        if (!room?.lastMessage) {
          unreadStatusRef.current = false;
          callback();
          return;
        }

        unreadStatusRef.current =
          room.lastMessage.senderId !== currentUserId &&
          room.members[currentUserId].lastReadAt < room.lastMessage.createdAt;
        callback();
      });

      return () => {
        unsubscribe();
        unreadStatusRef.current = false;
      };
    },
    [roomId, currentUserId],
  );

  const getServerSnapshot = useCallback(() => {
    return false;
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
