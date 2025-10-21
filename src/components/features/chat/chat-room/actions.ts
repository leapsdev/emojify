'use server';

import { sendMessage } from '@/repository/db/chat/actions';

/**
 * メッセージを送信
 */
export async function sendMessageAction(
  roomId: string,
  walletAddress: string,
  content: string,
): Promise<string> {
  return sendMessage(roomId, walletAddress, content);
}
