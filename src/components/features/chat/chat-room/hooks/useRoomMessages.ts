'use client';

import { db } from '@/lib/firebase/client';
import { getChatRoomAction } from '@/repository/chat/actions';
import type { Message } from '@/types/database';
import { DB_INDEXES } from '@/types/database';
import { onValue, ref } from 'firebase/database';
import { useCallback, useSyncExternalStore } from 'react';

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
  // ストアを更新するヘルパー関数
  const updateStore = useCallback(
    (updater: (current: MessageStore) => MessageStore) => {
      const current = storeMap.get(roomId) ?? createInitialStore(initialMessages);
      storeMap.set(roomId, updater(current));
    },
    [roomId, initialMessages],
  );

  // getSnapshot関数
  const getSnapshot = useCallback(() => {
    return storeMap.get(roomId)?.messages ?? initialMessages;
  }, [roomId, initialMessages]);

  // subscribe関数
  const subscribe = useCallback(
    (callback: () => void) => {
      // 初期ストア状態をセット
      updateStore((current) => current);

      const messagesRef = ref(db, `${DB_INDEXES.roomMessages}/${roomId}`);
      const unsubscribe = onValue(messagesRef, async () => {
        try {
          const { messages } = await getChatRoomAction(roomId);
          // メッセージをタイムスタンプでソート
          const sortedMessages = [...messages].sort(
            (a, b) => a.createdAt - b.createdAt,
          );
          updateStore(() => ({
            messages: sortedMessages,
            loading: false,
            error: null,
          }));
          callback();
        } catch (error) {
          updateStore((current) => ({
            ...current,
            error: error as Error,
            loading: false,
          }));
          callback();
        }
      });

      return () => {
        unsubscribe();
        storeMap.delete(roomId);
      };
    },
    [roomId, initialMessages, updateStore],
  );

  // サーバーレンダリング時は初期メッセージを返す
  const getServerSnapshot = useCallback(() => {
    return initialMessages;
  }, [initialMessages]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
