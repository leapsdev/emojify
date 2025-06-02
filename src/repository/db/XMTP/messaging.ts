import type { Client, Conversation, DecodedMessage } from '@xmtp/browser-sdk';

// 1対1のDM作成
export async function createDirectMessage(
  client: Client,
  recipientAddress: string,
) {
  try {
    const conversation = await client.conversations.newDm(recipientAddress);
    return conversation;
  } catch (error) {
    console.error('DMの作成に失敗しました:', error);
    throw error;
  }
}

// メッセージ送信
export async function sendMessage(conversation: Conversation, content: string) {
  try {
    await conversation.send(content);
  } catch (error) {
    console.error('メッセージの送信に失敗しました:', error);
    throw error;
  }
}

// メッセージ履歴取得
export async function getMessages(conversation: Conversation) {
  try {
    const messages = await conversation.messages();
    return messages;
  } catch (error) {
    console.error('メッセージ履歴の取得に失敗しました:', error);
    throw error;
  }
}

// メッセージのストリーミング
export async function streamMessages(
  conversation: Conversation,
  callback: (message: DecodedMessage) => void,
) {
  try {
    const stream = await conversation.stream();
    for await (const message of stream) {
      if (message) {
        callback(message);
      }
    }
  } catch (error) {
    console.error('メッセージのストリーミングに失敗しました:', error);
    throw error;
  }
}
