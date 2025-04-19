/**
 * Firebaseリアルタイムデータベースのデータ構造定義
 *
 * データベース構造:
 * /users/[userId] - ユーザー情報
 * /chatRooms/[roomId] - チャットルーム情報
 * /messages/[messageId] - メッセージ情報
 * /user-rooms/[userId]/[roomId] - ユーザーのチャットルームインデックス
 * /room-messages/[roomId]/[messageId] - チャットルームのメッセージインデックス
 */

/**
 * ユーザー情報の型定義
 * - ユーザーの基本情報を管理
 * - フレンドリストはオプショナル
 */
export interface User {
  id: string;
  email?: string | null;
  username: string;
  bio?: string | null;
  imageUrl?: string | null;
  createdAt: number;
  updatedAt: number;
  friends?: Record<string, { createdAt: number }>;
}

/**
 * メッセージの型定義
 * - チャットメッセージの内容と送信情報を管理
 */
export interface Message {
  id: string;
  content: string;
  senderId: string;
  roomId: string;
  createdAt: number;
  sent: boolean;
}

/**
 * チャットルームの型定義
 * - ルームのメンバーと最新メッセージを管理
 */
export interface ChatRoom {
  id: string;
  members: Record<
    string,
    {
      joinedAt: number;
      username: string;
      lastReadAt: number;
    }
  >;
  lastMessage?: {
    content: string;
    senderId: string;
    createdAt: number;
  };
  createdAt: number;
  updatedAt: number;
}

/**
 * データベースのルートパス定義
 */
export const DB_PATHS = {
  users: '/users',
  chatRooms: '/chatRooms',
  messages: '/messages',
  userRooms: '/user-rooms',
} as const;

/**
 * インデックス用のパス定義
 */
export const DB_INDEXES = {
  userRooms: '/user-rooms',
  roomMessages: '/room-messages',
} as const;

// 型の利用例:
// const userRef = ref(db, `${DB_PATHS.users}/${userId}`);
// const roomRef = ref(db, `${DB_PATHS.chatRooms}/${roomId}`);
// const messageRef = ref(db, `${DB_PATHS.messages}/${messageId}`);
