import type { Conversation, DecodedMessage, SendMessageResponse, ReceivedMessage } from './types';
import { getClient } from './client';

/**
 * 特定のアドレスとの会話を開始または取得
 */
export async function startConversation(peerAddress: string): Promise<Conversation> {
  const client = getClient();
  
  try {
    const conversation = await client.conversations.newConversation(peerAddress);
    return conversation;
  } catch (error) {
    console.error('Failed to start conversation:', error);
    throw new Error('会話の開始に失敗しました');
  }
}

/**
 * メッセージを送信
 */
export async function sendMessage(
  conversation: Conversation,
  messageContent: string
): Promise<SendMessageResponse> {
  try {
    const message = await conversation.send(messageContent);
    
    return {
      id: message.id,
      messageContent: message.content,
      senderAddress: message.senderAddress,
      sent: true,
      timestamp: message.sent
    };
  } catch (error) {
    console.error('Failed to send message:', error);
    throw new Error('メッセージの送信に失敗しました');
  }
}

/**
 * 最新のメッセージを取得
 */
export async function getMessages(conversation: Conversation): Promise<ReceivedMessage[]> {
  try {
    const messages = await conversation.messages();
    
    return messages.map((message: DecodedMessage) => ({
      id: message.id,
      messageContent: message.content,
      senderAddress: message.senderAddress,
      timestamp: message.sent
    }));
  } catch (error) {
    console.error('Failed to get messages:', error);
    throw new Error('メッセージの取得に失敗しました');
  }
}

/**
 * メッセージをストリーミング受信
 */
export async function streamMessages(
  conversation: Conversation,
  onMessage: (message: ReceivedMessage) => void
): Promise<() => void> {
  try {
    // メッセージストリームを開始
    // メッセージストリームを開始し、受信時のハンドラを設定
    for await (const message of await conversation.streamMessages()) {
      const receivedMessage: ReceivedMessage = {
        id: message.id,
        messageContent: message.content,
        senderAddress: message.senderAddress,
        timestamp: message.sent
      };
      onMessage(receivedMessage);
    }

    // クリーンアップ関数を返す
    return () => {};
  } catch (error) {
    console.error('Failed to stream messages:', error);
    throw new Error('メッセージストリームの開始に失敗しました');
  }
}

/**
 * 全ての会話リストを取得
 */
export async function listConversations(): Promise<Conversation[]> {
  const client = getClient();
  
  try {
    return await client.conversations.list();
  } catch (error) {
    console.error('Failed to list conversations:', error);
    throw new Error('会話リストの取得に失敗しました');
  }
}
