import {
  type Client,
  Conversation,
  type DecodedMessage,
  type Dm,
  type Group as XMTPGroup,
} from '@xmtp/browser-sdk';

export type XMTPClient = Client & {
  address: string;
};

export type XMTPDecodedMessage = DecodedMessage<string | unknown>;

// XMTP SDKの実際のConversationタイプに合わせて更新
export type XMTPConversation =
  | Dm<string | unknown>
  | XMTPGroup<string | unknown>;

export interface GroupMember {
  address: string;
  isOnXMTP: boolean;
}

export interface Group {
  id: string;
  name: string;
  members: GroupMember[];
  createdAt: Date;
  topic: string;
}

export interface GroupUpdated {
  type: 'group_updated';
  groupId: string;
  name?: string;
  members?: GroupMember[];
}

export type MessageMap = Map<string, Message[]>;
export type ConversationMap = Map<string, XMTPConversation>;

export interface Message {
  id: string;
  senderAddress: string;
  content: string;
  sent: boolean;
  timestamp: Date;
}

export const convertToXMTPMessage = (
  msg: XMTPDecodedMessage,
  currentUserAddress?: string,
): Message => ({
  id: msg.id,
  senderAddress: msg.senderInboxId,
  content: msg.content as string,
  sent: currentUserAddress ? msg.senderInboxId === currentUserAddress : false,
  timestamp: new Date(Number(msg.sentAtNs) / 1000000),
});
