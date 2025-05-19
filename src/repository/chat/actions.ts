'use server';

import { adminDb } from '@/repository/config/server';
import type { ChatRoom, Message, User } from '@/types/database';
import { DB_INDEXES, DB_PATHS } from '@/types/database';

/**
 * チャットルームの情報とメッセージを取得
 */
export async function getChatRoomAction(
  roomId: string,
): Promise<{ room: ChatRoom | null; messages: Message[] }> {
  try {
    // チャットルーム情報を取得
    const roomSnapshot = await adminDb
      .ref(`${DB_PATHS.chatRooms}/${roomId}`)
      .get();
    const room = roomSnapshot.val();
    if (!room) return { room: null, messages: [] };

    // メッセージ一覧を取得
    const messagesIndexSnapshot = await adminDb
      .ref(`${DB_INDEXES.roomMessages}/${roomId}`)
      .get();
    const messageIds = Object.keys(messagesIndexSnapshot.val() || {});

    const messagePromises = messageIds.map((messageId) =>
      adminDb.ref(`${DB_PATHS.messages}/${messageId}`).get(),
    );

    const messageSnapshots = await Promise.all(messagePromises);
    const messages = messageSnapshots
      .map((snapshot) => snapshot.val())
      .filter((message): message is Message => message !== null)
      .sort((a, b) => a.createdAt - b.createdAt);

    return { room, messages };
  } catch (error) {
    console.error('Failed to get chat room:', error);
    return { room: null, messages: [] };
  }
}

/**
 * 新しいチャットルームを作成
 */
export async function createChatRoom(members: string[]): Promise<string> {
  const newRoomRef = adminDb.ref(DB_PATHS.chatRooms).push();
  const roomId = newRoomRef.key;
  if (!roomId) {
    throw new Error('Failed to generate room ID');
  }

  const membersRecord: Record<
    string,
    { joinedAt: number; username: string; lastReadAt: number }
  > = {};
  const now = Date.now();

  // メンバーのユーザー情報を取得
  const memberUsers = await Promise.all(
    members.map((memberId) =>
      adminDb.ref(`${DB_PATHS.users}/${memberId}`).get(),
    ),
  );

  memberUsers.forEach((snapshot, index) => {
    const user = snapshot.val();
    if (!user) throw new Error(`User not found: ${members[index]}`);

    membersRecord[members[index]] = {
      joinedAt: now,
      username: user.username,
      lastReadAt: now,
    };
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
 * チャットルーム内のユーザー情報を更新
 */
export async function updateUserInChatRooms(
  userId: string,
  userData: Pick<User, 'username' | 'imageUrl'>,
): Promise<void> {
  // ユーザーが参加している全てのチャットルームを取得
  const userRoomsSnapshot = await adminDb
    .ref(`${DB_INDEXES.userRooms}/${userId}`)
    .get();
  const userRooms = userRoomsSnapshot.val() || {};
  const roomIds = Object.keys(userRooms);

  // 各チャットルームのメンバー情報を更新
  const updates: Record<string, string | null> = {};
  roomIds.forEach((roomId) => {
    if (userData.username) {
      updates[`${DB_PATHS.chatRooms}/${roomId}/members/${userId}/username`] =
        userData.username;
    }
    if (userData.imageUrl !== undefined) {
      updates[`${DB_PATHS.chatRooms}/${roomId}/members/${userId}/imageUrl`] =
        userData.imageUrl;
    }
  });

  if (Object.keys(updates).length > 0) {
    await adminDb.ref().update(updates);
  }
}

/**
 * メッセージを送信
 */
export async function sendMessage(
  roomId: string,
  senderId: string,
  content: string,
): Promise<string> {
  // パラメータのバリデーション
  if (!roomId) throw new Error('Room ID is required');
  if (!senderId) throw new Error('Sender ID is required');
  if (!content) throw new Error('Message content is required');

  // ユーザーの存在確認
  const userSnapshot = await adminDb.ref(`${DB_PATHS.users}/${senderId}`).get();
  if (!userSnapshot.exists()) {
    throw new Error(`User not found: ${senderId}`);
  }

  // ルームの存在確認
  const roomSnapshot = await adminDb
    .ref(`${DB_PATHS.chatRooms}/${roomId}`)
    .get();
  if (!roomSnapshot.exists()) {
    throw new Error(`Room not found: ${roomId}`);
  }

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

  // ルームの最終メッセージを更新し、送信者の既読状態も更新
  const roomUpdate: Partial<ChatRoom> = {
    lastMessage: {
      content,
      senderId,
      createdAt: now,
    },
    updatedAt: now,
    [`members/${senderId}/lastReadAt`]: now,
  };

  await adminDb.ref(`${DB_PATHS.chatRooms}/${roomId}`).update(roomUpdate);

  // メッセージインデックスを更新
  await adminDb
    .ref(`${DB_INDEXES.roomMessages}/${roomId}/${messageId}`)
    .set(true);

  return messageId;
}

/**
 * ユーザーのチャットルーム一覧を取得
 */
export async function getUserRooms(userId: string): Promise<ChatRoom[]> {
  const userRoomsSnapshot = await adminDb
    .ref(`${DB_INDEXES.userRooms}/${userId}`)
    .get();
  const userRooms = userRoomsSnapshot.val() || {};
  const roomIds = Object.keys(userRooms);

  const rooms: ChatRoom[] = [];
  for (const roomId of roomIds) {
    const roomSnapshot = await adminDb
      .ref(`${DB_PATHS.chatRooms}/${roomId}`)
      .get();
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
export async function addRoomMember(
  roomId: string,
  userId: string,
): Promise<void> {
  const updates: Record<
    string,
    { joinedAt: number; username: string; lastReadAt: number } | boolean
  > = {};
  const now = Date.now();

  // ルームのメンバーリストを更新
  // ユーザー情報を取得
  const userSnapshot = await adminDb.ref(`${DB_PATHS.users}/${userId}`).get();
  const user = userSnapshot.val();
  if (!user) throw new Error(`User not found: ${userId}`);

  updates[`${DB_PATHS.chatRooms}/${roomId}/members/${userId}`] = {
    joinedAt: now,
    username: user.username,
    lastReadAt: now,
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
  const roomSnapshot = await adminDb
    .ref(`${DB_PATHS.chatRooms}/${roomId}`)
    .get();
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

/**
 * メッセージを既読にする
 */
export async function updateLastReadAction(
  roomId: string,
  userId: string,
): Promise<void> {
  // パラメータのバリデーション
  if (!roomId) throw new Error('Room ID is required');
  if (!userId) throw new Error('User ID is required');

  const now = Date.now();

  // ルームとユーザーの存在確認
  const roomRef = adminDb.ref(`${DB_PATHS.chatRooms}/${roomId}`);
  const roomSnapshot = await roomRef.get();

  if (!roomSnapshot.exists()) {
    throw new Error(`Room not found: ${roomId}`);
  }

  const room = roomSnapshot.val() as ChatRoom;
  if (!room.members[userId]) {
    throw new Error(`User ${userId} is not a member of room ${roomId}`);
  }

  // 最終既読時刻を更新
  await roomRef.child(`members/${userId}/lastReadAt`).set(now);
}

/**
 * メンバーが完全一致するチャットルームを検索
 * @param members 検索対象のメンバーID配列
 * @returns 完全一致するチャットルーム、存在しない場合はnull
 */
export async function findChatRoomByMembers(
  members: string[],
): Promise<ChatRoom | null> {
  // メンバー配列をSetに変換
  const memberSet = new Set(members);

  // 最初のメンバーのチャットルーム一覧を取得
  const firstMemberRooms = await getUserRooms(members[0]);

  // メンバーが完全一致するルームを検索
  return (
    firstMemberRooms.find((room) => {
      const roomMembers = Object.keys(room.members);
      return (
        roomMembers.length === memberSet.size &&
        roomMembers.every((memberId) => memberSet.has(memberId))
      );
    }) ?? null
  );
}
