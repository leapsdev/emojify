'use server';

import { sendMessage } from '@/repository/chat/actions';

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
