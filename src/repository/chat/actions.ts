import 'server-only';
import { adminDb } from '@/lib/firebase/admin';
import { db } from '@/lib/firebase/client';
import type { ChatRoom, Message } from '@/types/database';
import { DB_INDEXES, DB_PATHS } from '@/types/database';
import { get, off, onValue, ref } from 'firebase/database';

/**
 * 新しいチャットルームを作成
 */
export async function createChatRoom(members: string[]): Promise<string> {
  const newRoomRef = adminDb.ref(DB_PATHS.chatRooms).push();
  const roomId = newRoomRef.key;
  if (!roomId) {
    throw new Error('Failed to generate room ID');
  }

  const membersRecord: Record<string, { joinedAt: number }> = {};
  const now = Date.now();

  members.forEach((memberId) => {
    membersRecord[memberId] = { joinedAt: now };
  });

  const newRoom: ChatRoom = {
    id: roomId,
    members: membersRecord,
    createdAt: now,
    updatedAt: now,
  };

  await newRoomRef.set(newRoom);

  // ユーザーのルームインデックスを更新
  const updates: Record<string, boolean> = {};
  members.forEach((memberId) => {
    updates[`${DB_INDEXES.userRooms}/${memberId}/${roomId}`] = true;
  });

  await adminDb.ref().update(updates);
  return roomId;
}

/**
 * メッセージを送信
 */
export async function sendMessage(
  roomId: string,
  senderId: string,
  content: string,
): Promise<string> {
  const newMessageRef = adminDb.ref(DB_PATHS.messages).push();
  const messageId = newMessageRef.key;
  if (!messageId) {
    throw new Error('Failed to generate message ID');
  }
  const now = Date.now();

  const message: Message = {
    id: messageId,
    content,
    senderId,
    roomId,
    createdAt: now,
    sent: true,
  };

  await newMessageRef.set(message);

  // ルームの最終メッセージを更新
  const roomUpdate: Partial<ChatRoom> = {
    lastMessage: {
      content,
      senderId,
      createdAt: now,
    },
    updatedAt: now,
  };

  await adminDb.ref(`${DB_PATHS.chatRooms}/${roomId}`).update(roomUpdate);

  // メッセージインデックスを更新
  await adminDb.ref(`${DB_INDEXES.roomMessages}/${roomId}/${messageId}`).set(true);

  return messageId;
}

/**
 * ルームのメッセージをリアルタイムで購読
 * @param roomId ルームID
 * @param onMessage メッセージを受信したときのコールバック
 * @returns 購読解除用の関数
 */
export function subscribeToRoomMessages(
  roomId: string,
  onMessage: (messages: Message[]) => void,
): () => void {
  const messagesRef = ref(db, `${DB_INDEXES.roomMessages}/${roomId}`);
  const messages: Message[] = [];

  // 初期データと更新の監視
  onValue(messagesRef, async (indexSnapshot) => {
    const messageIds = Object.keys(indexSnapshot.val() || {});

    // 全メッセージを取得
    const messageSnapshots = await Promise.all(
      messageIds.map((messageId) =>
        get(ref(db, `${DB_PATHS.messages}/${messageId}`)),
      ),
    );

    // メッセージを配列に変換
    messages.length = 0; // 配列をクリア
    messageSnapshots.forEach((snapshot) => {
      const message = snapshot.val() as Message;
      if (message) {
        messages.push(message);
      }
    });

    // タイムスタンプでソート
    messages.sort((a, b) => a.createdAt - b.createdAt);

    // コールバックを呼び出し
    onMessage(messages);
  });

  // クリーンアップ用の関数を返す
  return () => {
    off(messagesRef);
  };
}

/**
 * 一度だけメッセージを取得（レガシー互換用）
 */
export async function getRoomMessages(roomId: string): Promise<Message[]> {
  const indexSnapshot = await adminDb.ref(`${DB_INDEXES.roomMessages}/${roomId}`).get();
  const messageIds = Object.keys(indexSnapshot.val() || {});

  const messageSnapshots = await Promise.all(
    messageIds.map((messageId) =>
      adminDb.ref(`${DB_PATHS.messages}/${messageId}`).get(),
    ),
  );

  const messages = messageSnapshots
    .map((snapshot) => snapshot.val() as Message)
    .filter((message) => message !== null);

  return messages.sort((a, b) => a.createdAt - b.createdAt);
}

/**
 * ユーザーのチャットルーム一覧を取得
 */
export async function getUserRooms(userId: string): Promise<ChatRoom[]> {
  const userRoomsSnapshot = await adminDb.ref(`${DB_INDEXES.userRooms}/${userId}`).get();
  const userRooms = userRoomsSnapshot.val() || {};
  const roomIds = Object.keys(userRooms);

  const rooms: ChatRoom[] = [];
  for (const roomId of roomIds) {
    const roomSnapshot = await adminDb.ref(`${DB_PATHS.chatRooms}/${roomId}`).get();
    const room = roomSnapshot.val() as ChatRoom;
    if (room) {
      rooms.push(room);
    }
  }

  return rooms.sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * ユーザーのチャットルーム一覧をリアルタイムで購読
 * @param userId ユーザーID
 * @param onRooms ルーム一覧が更新されたときのコールバック
 * @returns 購読解除用の関数
 */
export function subscribeToUserRooms(
  userId: string,
  onRooms: (rooms: ChatRoom[]) => void,
): () => void {
  const userRoomsRef = ref(db, `${DB_INDEXES.userRooms}/${userId}`);
  const rooms: ChatRoom[] = [];

  // リアルタイム監視を設定
  onValue(userRoomsRef, async (indexSnapshot) => {
    const userRooms = indexSnapshot.val() || {};
    const roomIds = Object.keys(userRooms);

    // 各ルームの詳細を取得
    const roomSnapshots = await Promise.all(
      roomIds.map((roomId) => get(ref(db, `${DB_PATHS.chatRooms}/${roomId}`))),
    );

    // 配列を更新
    rooms.length = 0;
    roomSnapshots.forEach((snapshot) => {
      const room = snapshot.val() as ChatRoom;
      if (room) {
        rooms.push(room);
      }
    });

    // 更新日時でソート
    rooms.sort((a, b) => b.updatedAt - a.updatedAt);

    // コールバックを呼び出し
    onRooms(rooms);
  });

  // クリーンアップ関数を返す
  return () => off(userRoomsRef);
}

/**
 * チャットルームにメンバーを追加
 */
export async function addRoomMember(
  roomId: string,
  userId: string,
): Promise<void> {
  const updates: Record<string, { joinedAt: number } | boolean> = {};
  const now = Date.now();

  // ルームのメンバーリストを更新
  updates[`${DB_PATHS.chatRooms}/${roomId}/members/${userId}`] = {
    joinedAt: now,
  };

  // ユーザーのルームインデックスを更新
  updates[`${DB_INDEXES.userRooms}/${userId}/${roomId}`] = true;

  await adminDb.ref().update(updates);
}

/**
 * チャットルームからメンバーを削除
 */
export async function removeRoomMember(
  roomId: string,
  userId: string,
): Promise<void> {
  const updates: Record<string, null> = {};

  // ルームのメンバーリストから削除
  updates[`${DB_PATHS.chatRooms}/${roomId}/members/${userId}`] = null;

  // ユーザーのルームインデックスから削除
  updates[`${DB_INDEXES.userRooms}/${userId}/${roomId}`] = null;

  await adminDb.ref().update(updates);
}

/**
 * チャットルームを削除
 */
export async function deleteChatRoom(roomId: string): Promise<void> {
  // ルームのメンバー一覧を取得
  const roomSnapshot = await adminDb.ref(`${DB_PATHS.chatRooms}/${roomId}`).get();
  const room = roomSnapshot.val() as ChatRoom;

  if (!room) return;

  const updates: Record<string, null> = {};

  // 各メンバーのインデックスからルームを削除
  Object.keys(room.members).forEach((memberId) => {
    updates[`${DB_INDEXES.userRooms}/${memberId}/${roomId}`] = null;
  });

  // ルーム自体を削除
  updates[`${DB_PATHS.chatRooms}/${roomId}`] = null;

  // ルームのメッセージインデックスを削除
  updates[`${DB_INDEXES.roomMessages}/${roomId}`] = null;

  await adminDb.ref().update(updates);
}
