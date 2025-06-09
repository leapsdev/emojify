'use server';

import { Client } from '@xmtp/xmtp-js';

let xmtpClientInstance: Client | null = null;

export async function setXMTPClient(client: Client) {
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

    // すべてのアクティブな会話にメッセージを送信
    const conversations = await xmtpClientInstance.conversations.list();
    let success = false;

    for (const conversation of conversations) {
      try {
        await conversation.send(content);
        success = true;
      } catch (err) {
        console.error(`会話 ${conversation.peerAddress} へのメッセージ送信に失敗:`, err);
      }
    }

    if (!success) {
      throw new Error('どの会話にもメッセージを送信できませんでした');
    }

    return { success: true };
  } catch (error) {
    console.error('メッセージの送信に失敗:', error);
    return { success: false, error: error instanceof Error ? error.message : '送信に失敗しました' };
  }
}
