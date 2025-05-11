'use client';

import { db } from '@/lib/firebase/client';
import type { ChatRoom } from '@/types/database';
import { DB_PATHS } from '@/types/database';
import { onValue, ref } from 'firebase/database';
import { useCallback, useRef, useSyncExternalStore } from 'react';

export function useRoomMembers(roomId: string) {
  const membersRef = useRef<ChatRoom['members']>({});

  const getSnapshot = useCallback(() => {
    return membersRef.current;
  }, []);

  const subscribe = useCallback(
    (callback: () => void) => {
      const roomRef = ref(db, `${DB_PATHS.chatRooms}/${roomId}`);

      const unsubscribe = onValue(roomRef, (snapshot) => {
        const room = snapshot.val() as ChatRoom;
        if (!room) {
          membersRef.current = {};
          callback();
          return;
        }

        membersRef.current = room.members;
        callback();
      });

      return () => {
        unsubscribe();
        membersRef.current = {};
      };
    },
    [roomId],
  );

  const getServerSnapshot = useCallback(() => {
    return {};
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
