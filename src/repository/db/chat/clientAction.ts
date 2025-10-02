'use client';

import { db } from '@/repository/db/config/client';
import type { ChatRoom } from '@/repository/db/database';
import { DB_PATHS } from '@/repository/db/database';
import { get, onValue, ref } from 'firebase/database';

/**
 * チャットルームの変更をリアルタイムで監視する（クライアントサイド）
 * @param roomId チャットルームID
 * @param callback 変更時のコールバック関数
 * @returns 監視を停止する関数
 * @description Firebase Realtime Databaseのリスナーを設定し、ルーム情報の変更を監視
 */
/**
 * チャットルームの情報を取得する（クライアントサイド）
 * @param roomId チャットルームID
 * @returns チャットルーム情報（存在しない場合はnull）
 * @throws {Error} データベースエラー時
 */
export const getChatRoom = async (roomId: string): Promise<ChatRoom | null> => {
  const roomRef = ref(db, `${DB_PATHS.chatRooms}/${roomId}`);
  const snapshot = await get(roomRef);
  return snapshot.val();
};

export const subscribeToChatRoom = (
  roomId: string,
  callback: (room: ChatRoom | null) => void,
): (() => void) => {
  const roomRef = ref(db, `${DB_PATHS.chatRooms}/${roomId}`);
  return onValue(roomRef, (snapshot) => {
    callback(snapshot.val());
  });
};
