'use client';

import { db } from '@/lib/firebase/client';
import type { Message } from '@/types/database';
import { DB_INDEXES } from '@/types/database';
import { onValue, ref } from 'firebase/database';
import { useCallback, useSyncExternalStore } from 'react';
import { getChatRoomAction } from '@/repository/chat/actions';

// メッセージストアの型定義
interface MessageStore {
  messages: Message[];
  loading: boolean;
  error: Error | null;
}

// 初期ストア状態の作成
const createInitialStore = (initialMessages: Message[] = []): MessageStore => ({
  messages: initialMessages,
  loading: false,
  error: null,
});

// 各ルーム用のストアを保持するマップ
const storeMap = new Map<string, MessageStore>();

export function useRoomMessages(
  roomId: string,
  initialMessages: Message[] = [],
) {
  // getSnapshot関数
  const getSnapshot = useCallback(() => {
    return storeMap.get(roomId)?.messages ?? initialMessages;
  }, [roomId, initialMessages]);

  // subscribe関数
  const subscribe = useCallback(
    (callback: () => void) => {
      // 初期ストア状態をセット
      if (!storeMap.has(roomId)) {
        storeMap.set(roomId, createInitialStore(initialMessages));
      }

      const messagesRef = ref(db, `${DB_INDEXES.roomMessages}/${roomId}`);
      const unsubscribe = onValue(messagesRef, async () => {
        try {
          const { messages } = await getChatRoomAction(roomId);
          // メッセージをタイムスタンプでソート
          const sortedMessages = [...messages].sort((a, b) => a.createdAt - b.createdAt);
          storeMap.set(roomId, {
            messages: sortedMessages,
            loading: false,
            error: null,
          });
          callback();
        } catch (error) {
          storeMap.set(roomId, {
            ...storeMap.get(roomId)!,
            error: error as Error,
            loading: false,
          });
          callback();
        }
      });

      return () => {
        unsubscribe();
        storeMap.delete(roomId);
      };
    },
    [roomId, initialMessages],
  );

  return useSyncExternalStore(subscribe, getSnapshot);
}
