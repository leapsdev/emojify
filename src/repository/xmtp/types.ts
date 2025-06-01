import type { Client, Conversation, DecodedMessage } from '@xmtp/browser-sdk';

/**
 * XMTPクライアントの設定オプション
 */
export interface XMTPClientOptions {
  env?: 'production' | 'dev';
}

/**
 * メッセージ送信のレスポンス
 */
export interface SendMessageResponse {
  id: string;
  messageContent: string;
  senderAddress: string;
  sent: boolean;
  timestamp: Date;
}

/**
 * 受信メッセージの形式
 */
export interface ReceivedMessage {
  id: string;
  messageContent: string;
  senderAddress: string;
  timestamp: Date;
}

export type XMTPClient = Client;
export type XMTPConversation = Conversation;
export type XMTPDecodedMessage = DecodedMessage<string>;

// メッセージの型を定義
export interface XMTPMessage {
  id: string;
  content: string;
  senderAddress: string;
  sent: Date;
}

// 型安全な変換関数
export function convertToXMTPMessage(
  message: DecodedMessage<string>,
): XMTPMessage {
  return {
    id: message.id,
    content: message.content ?? '',
    senderAddress: message.senderInboxId ?? '',
    sent: message.sentAtNs
      ? new Date(Number(message.sentAtNs) / 1_000_000)
      : new Date(),
  };
}
