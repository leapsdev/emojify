import { ref, set, get, push, update } from 'firebase/database';
import { db } from '@/lib/firebase/client';
import type { Message, ChatRoom } from '@/types/database';
import { DB_PATHS, DB_INDEXES } from '@/types/database';

/**
 * 新しいチャットルームを作成
 */
export async function createChatRoom(members: string[]): Promise<string> {
  const newRoomRef = push(ref(db, DB_PATHS.chatRooms));
  const roomId = newRoomRef.key!;
  
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

  await set(newRoomRef, newRoom);

  // ユーザーのルームインデックスを更新
  const updates: Record<string, boolean> = {};
  members.forEach((memberId) => {
    updates[`${DB_INDEXES.userRooms}/${memberId}/${roomId}`] = true;
  });

  await update(ref(db), updates);
  return roomId;
}

/**
 * メッセージを送信
 */
export async function sendMessage(roomId: string, senderId: string, content: string): Promise<string> {
  const newMessageRef = push(ref(db, DB_PATHS.messages));
  const messageId = newMessageRef.key!;
  const now = Date.now();

  const message: Message = {
    id: messageId,
    content,
    senderId,
    roomId,
    createdAt: now,
    sent: true,
  };

  await set(newMessageRef, message);

  // ルームの最終メッセージを更新
  const roomUpdate: Partial<ChatRoom> = {
    lastMessage: {
      content,
      senderId,
      createdAt: now,
    },
    updatedAt: now,
  };

  await update(ref(db, `${DB_PATHS.chatRooms}/${roomId}`), roomUpdate);

  // メッセージインデックスを更新
  await set(
    ref(db, `${DB_INDEXES.roomMessages}/${roomId}/${messageId}`),
    true
  );

  return messageId;
}

/**
 * ルームのメッセージを取得
 */
export async function getRoomMessages(roomId: string): Promise<Message[]> {
  const snapshot = await get(ref(db, `${DB_PATHS.messages}`));
  const messages = snapshot.val() as Record<string, Message> || {};
  
  return Object.values(messages)
    .filter((message) => message.roomId === roomId)
    .sort((a, b) => a.createdAt - b.createdAt);
}

/**
 * ユーザーのチャットルーム一覧を取得
 */
export async function getUserRooms(userId: string): Promise<ChatRoom[]> {
  const userRoomsSnapshot = await get(
    ref(db, `${DB_INDEXES.userRooms}/${userId}`)
  );
  const userRooms = userRoomsSnapshot.val() || {};
  const roomIds = Object.keys(userRooms);

  const rooms: ChatRoom[] = [];
  for (const roomId of roomIds) {
    const roomSnapshot = await get(
      ref(db, `${DB_PATHS.chatRooms}/${roomId}`)
    );
    const room = roomSnapshot.val() as ChatRoom;
    if (room) {
      rooms.push(room);
    }
  }

  return rooms.sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * チャットルームにメンバーを追加
 */
export async function addRoomMember(roomId: string, userId: string): Promise<void> {
  const updates: Record<string, { joinedAt: number } | boolean> = {};
  const now = Date.now();

  // ルームのメンバーリストを更新
  updates[`${DB_PATHS.chatRooms}/${roomId}/members/${userId}`] = {
    joinedAt: now,
  };
  
  // ユーザーのルームインデックスを更新
  updates[`${DB_INDEXES.userRooms}/${userId}/${roomId}`] = true;

  await update(ref(db), updates);
}

/**
 * チャットルームからメンバーを削除
 */
export async function removeRoomMember(roomId: string, userId: string): Promise<void> {
  const updates: Record<string, null> = {};
  
  // ルームのメンバーリストから削除
  updates[`${DB_PATHS.chatRooms}/${roomId}/members/${userId}`] = null;
  
  // ユーザーのルームインデックスから削除
  updates[`${DB_INDEXES.userRooms}/${userId}/${roomId}`] = null;

  await update(ref(db), updates);
}

/**
 * チャットルームを削除
 */
export async function deleteChatRoom(roomId: string): Promise<void> {
  // ルームのメンバー一覧を取得
  const roomSnapshot = await get(ref(db, `${DB_PATHS.chatRooms}/${roomId}`));
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

  await update(ref(db), updates);
}
