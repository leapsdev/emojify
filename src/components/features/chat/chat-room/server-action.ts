'use server';

import { adminDb } from '@/lib/firebase/admin';
import type { Message } from '@/types/database';
import { DB_INDEXES, DB_PATHS } from '@/types/database';

/**
 * メッセージを送信
 */
export async function sendMessage(
  roomId: string,
  senderId: string,
  content: string,
): Promise<string> {
  const newMessageRef = adminDb.ref(DB_PATHS.messages).push();
  const messageId = newMessageRef.key;
  if (!messageId) {
    throw new Error('Failed to generate message ID');
  }
  const now = Date.now();

  const message: Message = {
    id: messageId,
    content,
    senderId,
    roomId,
    createdAt: now,
    sent: true,
  };

  await newMessageRef.set(message);

  // ルームの最終メッセージを更新
  const roomUpdate = {
    lastMessage: {
      content,
      senderId,
      createdAt: now,
    },
    updatedAt: now,
  };

  await adminDb.ref(`${DB_PATHS.chatRooms}/${roomId}`).update(roomUpdate);

  // メッセージインデックスを更新
  await adminDb.ref(`${DB_INDEXES.roomMessages}/${roomId}/${messageId}`).set(true);

  return messageId;
}
