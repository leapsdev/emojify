'use client';

import { db } from '@/lib/firebase/client';
import type { Message } from '@/types/database';
import { DB_INDEXES, DB_PATHS } from '@/types/database';
import { off, onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';

export function useRoomMessages(
  roomId: string,
  initialMessages: Message[] = [],
) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  useEffect(() => {
    if (!roomId) return;

    const messagesRef = ref(db, `${DB_INDEXES.roomMessages}/${roomId}`);
    let messageRefs: ReturnType<typeof ref>[] = [];
    const currentMessages: Message[] = [...initialMessages];

    // メッセージインデックスの監視
    const indexUnsubscribe = onValue(messagesRef, (indexSnapshot) => {
      const messageIds = Object.keys(indexSnapshot.val() || {});

      // 既存のリスナーをクリーンアップ
      messageRefs.forEach((ref) => off(ref));
      messageRefs = [];

      // 新しいメッセージの監視をセットアップ
      messageIds.forEach((messageId) => {
        const messageRef = ref(db, `${DB_PATHS.messages}/${messageId}`);
        messageRefs.push(messageRef);

        onValue(messageRef, (snapshot) => {
          const message = snapshot.val() as Message;
          if (message) {
            // 既存のメッセージを更新するか、新しいメッセージを追加
            const index = currentMessages.findIndex((m) => m.id === message.id);
            if (index !== -1) {
              currentMessages[index] = message;
            } else {
              currentMessages.push(message);
            }

            // タイムスタンプでソート
            currentMessages.sort((a, b) => a.createdAt - b.createdAt);

            // 状態を更新
            setMessages([...currentMessages]);
          }
        });
      });
    });

    // クリーンアップ
    return () => {
      indexUnsubscribe();
      messageRefs.forEach((ref) => off(ref));
    };
  }, [roomId, initialMessages]);

  return messages;
}
