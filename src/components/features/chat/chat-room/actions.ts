'use server';

import { sendMessage } from '@/repository/db/chat/actions';

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
