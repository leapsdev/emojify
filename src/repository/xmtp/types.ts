import type { Client, Conversation, DecodedMessage } from '@xmtp/xmtp-js';

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

export type { Client as XMTPClient, Conversation, DecodedMessage };
