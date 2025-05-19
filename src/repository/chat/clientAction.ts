'use client';

import { db } from '@/repository/config/client';
import type { ChatRoom } from '@/repository/database';
import { DB_PATHS } from '@/repository/database';
import {
  get,
  onValue,
  push,
  ref,
  remove,
  set,
  update,
} from 'firebase/database';

/**
 * チャットルームの情報を取得
 */
export const getChatRoom = async (roomId: string): Promise<ChatRoom | null> => {
  const roomRef = ref(db, `${DB_PATHS.chatRooms}/${roomId}`);
  const snapshot = await get(roomRef);
  return snapshot.val();
};

/**
 * チャットルームの変更を監視
 */
export const subscribeToChatRoom = (
  roomId: string,
  callback: (room: ChatRoom | null) => void,
): (() => void) => {
  const roomRef = ref(db, `${DB_PATHS.chatRooms}/${roomId}`);
  return onValue(roomRef, (snapshot) => {
    callback(snapshot.val());
  });
};

/**
 * ユーザーのチャットルーム一覧を監視
 */
export const subscribeToUserRooms = (
  userId: string,
  callback: (rooms: ChatRoom[]) => void,
): (() => void) => {
  const userRoomsRef = ref(db, `${DB_PATHS.userRooms}/${userId}`);
  return onValue(userRoomsRef, async (snapshot) => {
    try {
      const snapshotVal = snapshot.val();
      if (!snapshotVal) {
        callback([]);
        return;
      }

      const roomIds = Object.keys(snapshotVal);
      const roomPromises = roomIds.map((roomId) =>
        get(ref(db, `${DB_PATHS.chatRooms}/${roomId}`)),
      );
      const roomSnapshots = await Promise.all(roomPromises);

      const rooms = roomSnapshots
        .map((snapshot) => snapshot.val())
        .filter((room): room is ChatRoom => room !== null)
        .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));

      callback(rooms);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
      callback([]);
    }
  });
};

/**
 * チャットルームを作成
 */
export const createChatRoom = async (
  roomData: Omit<ChatRoom, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> => {
  const timestamp = Date.now();
  const roomRef = push(ref(db, DB_PATHS.chatRooms));
  const roomId = roomRef.key;

  if (!roomId) {
    throw new Error('Failed to create chat room: No room ID generated');
  }

  const room: ChatRoom = {
    ...roomData,
    id: roomId,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await set(roomRef, room);
  return roomId;
};

/**
 * チャットルームを更新
 */
export const updateChatRoom = async (
  roomId: string,
  updates: Partial<Omit<ChatRoom, 'id' | 'createdAt'>>,
): Promise<void> => {
  const roomRef = ref(db, `${DB_PATHS.chatRooms}/${roomId}`);
  await update(roomRef, {
    ...updates,
    updatedAt: Date.now(),
  });
};

/**
 * チャットルームを削除
 */
export const deleteChatRoom = async (roomId: string): Promise<void> => {
  const roomRef = ref(db, `${DB_PATHS.chatRooms}/${roomId}`);
  await remove(roomRef);
};

/**
 * ユーザーをチャットルームに追加
 */
export const addUserToRoom = async (
  userId: string,
  roomId: string,
): Promise<void> => {
  const timestamp = Date.now();
  const updates = {
    [`${DB_PATHS.userRooms}/${userId}/${roomId}`]: { joinedAt: timestamp },
    [`${DB_PATHS.chatRooms}/${roomId}/members/${userId}`]: {
      joinedAt: timestamp,
    },
    [`${DB_PATHS.chatRooms}/${roomId}/updatedAt`]: timestamp,
  };
  await update(ref(db), updates);
};

/**
 * ユーザーをチャットルームから削除
 */
export const removeUserFromRoom = async (
  userId: string,
  roomId: string,
): Promise<void> => {
  const timestamp = Date.now();
  const updates = {
    [`${DB_PATHS.userRooms}/${userId}/${roomId}`]: null,
    [`${DB_PATHS.chatRooms}/${roomId}/members/${userId}`]: null,
    [`${DB_PATHS.chatRooms}/${roomId}/updatedAt`]: timestamp,
  };
  await update(ref(db), updates);
};
