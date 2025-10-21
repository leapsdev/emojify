'use client';

import { normalizeWalletAddress } from '@/lib/wallet-utils';
import { db } from '@/repository/db/config/client';
import type { ChatRoom } from '@/repository/db/database';
import { DB_INDEXES, DB_PATHS } from '@/repository/db/database';
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
 * ユーザーのチャットルーム一覧をリアルタイムで監視する（クライアントサイド）
 * @param userId ユーザーID（ウォレットアドレス）
 * @param callback 変更時のコールバック関数
 * @returns 監視を停止する関数
 * @throws {Error} データベースエラー時（エラーはログに記録され、空の配列を返す）
 * @description ユーザーが参加しているルーム一覧を取得し、更新日時降順でソート
 */
export const subscribeToUserRooms = (
  userId: string,
  callback: (rooms: ChatRoom[]) => void,
): (() => void) => {
  const normalizedId = normalizeWalletAddress(userId);
  const userRoomsRef = ref(db, `${DB_INDEXES.userRooms}/${normalizedId}`);
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
 * チャットルームを作成する（クライアントサイド）
 * @param roomData ルームデータ（id, createdAt, updatedAtは除く）
 * @returns 作成されたチャットルームID
 * @throws {Error} ルームID生成失敗時、データベースエラー時
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
 * チャットルームを更新する（クライアントサイド）
 * @param roomId チャットルームID
 * @param updates 更新するデータ（id, createdAtは除く）
 * @throws {Error} データベースエラー時
 * @description updatedAtは自動的に現在時刻に設定される
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
 * チャットルームを削除する（クライアントサイド）
 * @param roomId チャットルームID
 * @throws {Error} データベースエラー時
 */
export const deleteChatRoom = async (roomId: string): Promise<void> => {
  const roomRef = ref(db, `${DB_PATHS.chatRooms}/${roomId}`);
  await remove(roomRef);
};

/**
 * ユーザーをチャットルームに追加する（クライアントサイド）
 * @param userId ユーザーID（ウォレットアドレス）
 * @param roomId チャットルームID
 * @throws {Error} ユーザーが存在しない場合、データベースエラー時
 * @description ユーザーのルームインデックスとルームのメンバー情報を同時に更新
 */
export const addUserToRoom = async (
  userId: string,
  roomId: string,
): Promise<void> => {
  const timestamp = Date.now();

  // 新しいスキーマでは、userIdがウォレットアドレスを表す
  const normalizedAddress = normalizeWalletAddress(userId);

  const updates = {
    [`${DB_INDEXES.userRooms}/${normalizedAddress}/${roomId}`]: {
      joinedAt: timestamp,
    },
    [`${DB_PATHS.chatRooms}/${roomId}/members/${normalizedAddress}`]: {
      joinedAt: timestamp,
      lastReadAt: timestamp,
    },
    [`${DB_PATHS.chatRooms}/${roomId}/updatedAt`]: timestamp,
  };
  await update(ref(db), updates);
};

/**
 * ユーザーをチャットルームから削除する（クライアントサイド）
 * @param userId ユーザーID（ウォレットアドレス）
 * @param roomId チャットルームID
 * @throws {Error} データベースエラー時
 * @description ユーザーのルームインデックスとルームのメンバー情報を同時に削除
 */
export const removeUserFromRoom = async (
  userId: string,
  roomId: string,
): Promise<void> => {
  const timestamp = Date.now();

  // 新しいスキーマでは、userIdがウォレットアドレスを表す
  const normalizedAddress = normalizeWalletAddress(userId);

  const updates = {
    [`${DB_INDEXES.userRooms}/${normalizedAddress}/${roomId}`]: null,
    [`${DB_PATHS.chatRooms}/${roomId}/members/${normalizedAddress}`]: null,
    [`${DB_PATHS.chatRooms}/${roomId}/updatedAt`]: timestamp,
  };
  await update(ref(db), updates);
};
