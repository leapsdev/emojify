'use client';

import {
  getChatRoomAction,
  updateLastReadAction,
} from '@/repository/db/chat/actions';
import { db } from '@/repository/db/config/client';
import type { Message } from '@/repository/db/database';
import { DB_INDEXES } from '@/repository/db/database';
import { onValue, ref } from 'firebase/database';
import { useCallback, useMemo, useRef, useSyncExternalStore } from 'react';

export function useRoomMessages(
  roomId: string,
  currentWalletAddress: string,
  initialMessages: Message[] = [],
) {
  const messagesRef = useRef<Message[]>(initialMessages);

  const getSnapshot = useCallback(() => {
    return messagesRef.current;
  }, []);

  const subscribe = useCallback(
    (callback: () => void) => {
      const dbRef = ref(db, `${DB_INDEXES.roomMessages}/${roomId}`);

      const unsubscribe = onValue(dbRef, async () => {
        try {
          const { messages } = await getChatRoomAction(roomId);
          messagesRef.current = messages;

          // メッセージを受信したら既読状態を更新
          if (
            document.visibilityState === 'visible' &&
            messagesRef.current.length > 0
          ) {
            await updateLastReadAction(roomId, currentWalletAddress);
          }

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
    [roomId, currentWalletAddress, initialMessages],
  );

  // サーバーレンダリング時は初期メッセージを返す
  const getServerSnapshot = useCallback(() => {
    return initialMessages;
  }, [initialMessages]);

  const messages = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  // メッセージをメモ化してソート
  const sortedMessages = useMemo(() => {
    return [...messages].sort((a, b) => a.createdAt - b.createdAt);
  }, [messages]);

  return sortedMessages;
}
