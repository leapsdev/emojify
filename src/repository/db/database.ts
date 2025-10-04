/**
 * Firebaseリアルタイムデータベースのデータ構造定義
 *
 * データベース構造:
 * /users/[id] - ユーザー情報（idはウォレットアドレス）
 * /chatRooms/[roomId] - チャットルーム情報
 * /messages/[messageId] - メッセージ情報
 * /user-rooms/[id]/[roomId] - ユーザーのチャットルームインデックス（idはウォレットアドレス）
 * /room-messages/[roomId]/[messageId] - チャットルームのメッセージインデックス
 */

/**
 * ユーザー情報の型定義
 * - ユーザーの基本情報を管理
 * - idはウォレットアドレスを使用
 * - フレンドリストはオプショナル
 */
export interface User {
  id: string; // ウォレットアドレス
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
  senderWalletAddress: string; // ウォレットアドレス
  roomId: string;
  createdAt: number;
  sent: boolean;
}

/**
 * チャットルームの型定義
 * - ルームのメンバーと最新メッセージを管理
 * - メンバー情報は最小限（参加日時と既読日時のみ）
 * - ユーザー名やプロフィール画像はUserテーブルから取得
 */
export interface ChatRoom {
  id: string;
  members: Record<
    string, // キーはウォレットアドレス
    {
      joinedAt: number;
      lastReadAt: number;
    }
  >;
  lastMessage?: {
    content: string;
    senderWalletAddress: string; // ウォレットアドレス
    createdAt: number;
  };
  createdAt: number;
  updatedAt: number;
}

/**
 * データベースのルートパス定義
 */
export const DB_PATHS = {
  users: '/users', // idはウォレットアドレス
  chatRooms: '/chatRooms',
  messages: '/messages',
  userRooms: '/user-rooms', // idはウォレットアドレス
} as const;

/**
 * インデックス用のパス定義
 */
export const DB_INDEXES = {
  userRooms: '/user-rooms', // idはウォレットアドレス
  roomMessages: '/room-messages',
} as const;

// 型の利用例:
// const userRef = ref(db, `${DB_PATHS.users}/${walletAddress}`);
// const roomRef = ref(db, `${DB_PATHS.chatRooms}/${roomId}`);
// const messageRef = ref(db, `${DB_PATHS.messages}/${messageId}`);
