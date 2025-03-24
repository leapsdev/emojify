'use client';

import { db } from '@/lib/firebase/client';
import { sendMessage } from '@/repository/chat/actions';
import type { Message } from '@/types/database';
import { DB_INDEXES, DB_PATHS } from '@/types/database';
import { off, onValue, ref } from 'firebase/database';

/**
 * メッセージを送信
 */
export async function sendMessageAction(
  roomId: string,
  userId: string,
  content: string,
): Promise<string> {
  return sendMessage(roomId, userId, content);
}

/**
 * チャットルームのメッセージをリアルタイムで購読
 */
export function subscribeToRoomMessagesAction(
  roomId: string,
  onMessage: (messages: Message[]) => void,
) {
  return subscribeToRoomMessages(roomId, onMessage);
}

/**
 * チャットルームのメッセージをリアルタイムで購読
 */
function subscribeToRoomMessages(
  roomId: string,
  onMessage: (messages: Message[]) => void,
): () => void {
  const messagesRef = ref(db, `${DB_INDEXES.roomMessages}/${roomId}`);
  let messageRefs: ReturnType<typeof ref>[] = [];
  const currentMessages: Message[] = [];

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

          // コールバックを呼び出し
          onMessage([...currentMessages]); // 新しい配列を作成して状態を更新
        }
      });
    });
  });

  // クリーンアップ用の関数を返す
  return () => {
    indexUnsubscribe();
    messageRefs.forEach((ref) => off(ref));
  };
}