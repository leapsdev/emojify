import { Conversation } from '@xmtp/xmtp-js';

export type GroupMember = {
  address: string;
  isOnXMTP: boolean;
};

export type Group = {
  id: string;
  name: string;
  members: GroupMember[];
  conversation: Conversation | null;
}; 