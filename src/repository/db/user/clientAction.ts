'use client';

import { db } from '@/repository/db/config/client';
import type { User } from '@/repository/db/database';
import { get, onValue, ref, update } from 'firebase/database';

interface DisplayUser extends Pick<User, 'id' | 'username'> {
  displayName: string;
  walletAddress: string;
  avatar: string;
  section: 'friend' | 'other';
}

const USERS_PATH = 'users';

/**
 * ユーザー情報を取得する（クライアントサイド）
 * @param walletAddress ウォレットアドレス
 * @returns ユーザー情報（存在しない場合はnull）
 * @throws {Error} データベースエラー時
 */
export const getUser = async (walletAddress: string): Promise<User | null> => {
  const userRef = ref(db, `${USERS_PATH}/${walletAddress}`);
  const snapshot = await get(userRef);
  return snapshot.val();
};

/**
 * ユーザー情報を更新する（クライアントサイド）
 * @param walletAddress ウォレットアドレス
 * @param data 更新するデータ（id, createdAtは除く）
 * @throws {Error} データベースエラー時
 */
export const updateUser = async (
  walletAddress: string,
  data: Partial<Omit<User, 'id' | 'createdAt'>>,
): Promise<void> => {
  const userRef = ref(db, `${USERS_PATH}/${walletAddress}`);
  await update(userRef, data);
};

/**
 * フレンド関係を追加する（クライアントサイド・双方向）
 * @param walletAddress ウォレットアドレス
 * @param friendId フレンドのID（ウォレットアドレス）
 * @throws {Error} データベースエラー時
 * @description 双方向のフレンド関係を設定し、両方のユーザーのupdatedAtを更新
 */
export const addFriend = async (
  walletAddress: string,
  friendId: string,
): Promise<void> => {
  const timestamp = Date.now();
  const updates = {
    [`${USERS_PATH}/${walletAddress}/friends/${friendId}`]: {
      createdAt: timestamp,
    },
    [`${USERS_PATH}/${friendId}/friends/${walletAddress}`]: {
      createdAt: timestamp,
    },
    [`${USERS_PATH}/${walletAddress}/updatedAt`]: timestamp,
    [`${USERS_PATH}/${friendId}/updatedAt`]: timestamp,
  };
  await update(ref(db), updates);
};

/**
 * フレンド関係を削除する（クライアントサイド・双方向）
 * @param walletAddress ウォレットアドレス
 * @param friendId フレンドのID（ウォレットアドレス）
 * @throws {Error} データベースエラー時
 * @description 双方向のフレンド関係を削除し、両方のユーザーのupdatedAtを更新
 */
export const removeFriend = async (
  walletAddress: string,
  friendId: string,
): Promise<void> => {
  const timestamp = Date.now();
  const updates = {
    [`${USERS_PATH}/${walletAddress}/friends/${friendId}`]: null,
    [`${USERS_PATH}/${friendId}/friends/${walletAddress}`]: null,
    [`${USERS_PATH}/${walletAddress}/updatedAt`]: timestamp,
    [`${USERS_PATH}/${friendId}/updatedAt`]: timestamp,
  };
  await update(ref(db), updates);
};

/**
 * ユーザーリストの変更をリアルタイムで監視する（クライアントサイド）
 * @param callback 変更時のコールバック関数
 * @returns 監視を停止する関数
 * @description Firebase Realtime Databaseのリスナーを設定し、全ユーザー情報の変更を監視
 */
export const subscribeToUsers = (
  callback: (users: Record<string, User>) => void,
): (() => void) => {
  const usersRef = ref(db, USERS_PATH);
  return onValue(usersRef, (snapshot) => {
    const users = snapshot.val() || {};
    callback(users);
  });
};

/**
 * ユーザーをDisplayUser形式に変換する
 * @param user ユーザー情報
 * @param section セクション（'friend' | 'other'）
 * @returns DisplayUser形式のユーザー情報
 * @description UI表示用にユーザー情報を変換し、デフォルトアバターを設定
 */
export const convertToDisplayUser = (
  user: User,
  section: 'friend' | 'other',
): DisplayUser => {
  return {
    id: user.id,
    username: user.username,
    displayName: user.username,
    walletAddress: user.id,
    avatar: user.imageUrl || '/icons/faceIcon-192x192.png',
    section,
  };
};
