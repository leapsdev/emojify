import type { DecodedMessage } from '@xmtp/browser-sdk';
import { getClient } from './client';
import type {
  ReceivedMessage,
  SendMessageResponse,
  XMTPConversation,
  XMTPDecodedMessage,
  XMTPMessage,
} from './types';
import { convertToXMTPMessage } from './types';

/**
 * 特定のアドレスとの会話を開始または取得
 */
export async function startConversation(
  peerAddress: string,
): Promise<XMTPConversation> {
  const client = getClient();

  try {
    // V3では、アドレスをinbox IDとして使用
    const conversation = await client.conversations.newDm(peerAddress);
    return conversation as XMTPConversation;
  } catch (error) {
    console.error('Failed to start conversation:', error);
    throw new Error('会話の開始に失敗しました');
  }
}

/**
 * メッセージを送信
 */
export async function sendMessage(
  conversation: XMTPConversation,
  messageContent: string,
): Promise<SendMessageResponse> {
  try {
    const message = (await conversation.send(
      messageContent,
    )) as unknown as DecodedMessage<string>;
    const xmtpMessage = convertToXMTPMessage(message);

    return {
      id: xmtpMessage.id,
      messageContent: xmtpMessage.content,
      senderAddress: xmtpMessage.senderAddress,
      sent: true,
      timestamp: xmtpMessage.sent,
    };
  } catch (error) {
    console.error('Failed to send message:', error);
    throw new Error('メッセージの送信に失敗しました');
  }
}

/**
 * 最新のメッセージを取得
 */
export async function getMessages(
  conversation: XMTPConversation,
): Promise<ReceivedMessage[]> {
  try {
    const messages = await conversation.messages();

    return messages.map((message) => {
      const xmtpMessage = convertToXMTPMessage(
        message as DecodedMessage<string>,
      );
      return {
        id: xmtpMessage.id,
        messageContent: xmtpMessage.content,
        senderAddress: xmtpMessage.senderAddress,
        timestamp: xmtpMessage.sent,
      };
    });
  } catch (error) {
    console.error('Failed to get messages:', error);
    throw new Error('メッセージの取得に失敗しました');
  }
}

/**
 * メッセージをストリーミング受信
 */
export async function streamMessages(
  conversation: XMTPConversation,
  onMessage: (message: ReceivedMessage) => void,
): Promise<() => void> {
  try {
    // メッセージストリームを開始
    const stream = await conversation.stream();
    for await (const message of stream) {
      if (message) {
        const xmtpMessage = convertToXMTPMessage(
          message as DecodedMessage<string>,
        );
        const receivedMessage: ReceivedMessage = {
          id: xmtpMessage.id,
          messageContent: xmtpMessage.content,
          senderAddress: xmtpMessage.senderAddress,
          timestamp: xmtpMessage.sent,
        };
        onMessage(receivedMessage);
      }
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
export async function listConversations(): Promise<XMTPConversation[]> {
  const client = getClient();

  try {
    const conversations = await client.conversations.list();
    return conversations as XMTPConversation[];
  } catch (error) {
    console.error('Failed to list conversations:', error);
    throw new Error('会話リストの取得に失敗しました');
  }
}
