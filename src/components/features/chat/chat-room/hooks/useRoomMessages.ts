'use client';

import { db } from '@/lib/firebase/client';
import { getChatRoomAction } from '@/repository/chat/actions';
import type { Message } from '@/types/database';
import { DB_INDEXES } from '@/types/database';
import { onValue, ref } from 'firebase/database';
import { useCallback, useRef, useSyncExternalStore } from 'react';

export function useRoomMessages(
  roomId: string,
  initialMessages: Message[] = [],
) {
  // メッセージをrefで管理
  const messagesRef = useRef<Message[]>(initialMessages);

  // メッセージの取得と並び替え
  const getSnapshot = useCallback(() => {
    return messagesRef.current;
  }, []);

  // メッセージの購読
  const subscribe = useCallback(
    (callback: () => void) => {
      const dbRef = ref(db, `${DB_INDEXES.roomMessages}/${roomId}`);
      
      const unsubscribe = onValue(dbRef, async () => {
        try {
          const { messages } = await getChatRoomAction(roomId);
          messagesRef.current = [...messages].sort(
            (a, b) => a.createdAt - b.createdAt,
          );
          callback();
        } catch (error) {
          console.error('Failed to fetch messages:', error);
        }
      });

      return () => {
        unsubscribe();
        messagesRef.current = initialMessages;
      };
    },
    [roomId, initialMessages],
  );

  // サーバーレンダリング時は初期メッセージを返す
  const getServerSnapshot = useCallback(() => {
    return initialMessages;
  }, [initialMessages]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
