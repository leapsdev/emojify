'use server';

import { Client } from '@xmtp/xmtp-js';

let xmtpClientInstance: Client | null = null;

export function setXMTPClient(client: Client) {
  xmtpClientInstance = client;
}

export async function sendMessageAction(
  roomId: string,
  userId: string,
  content: string,
) {
  try {
    if (!xmtpClientInstance) {
      throw new Error('XMTPクライアントが初期化されていません');
    }

    // 既存の会話があれば取得
    const conversations = await xmtpClientInstance.conversations.list();
    for (const conversation of conversations) {
      try {
        await conversation.send(content);
      } catch (err) {
        console.error('メッセージの送信に失敗:', err);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('メッセージの送信に失敗:', error);
    return { success: false, error: error instanceof Error ? error.message : '送信に失敗しました' };
  }
}
