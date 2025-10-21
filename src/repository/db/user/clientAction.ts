'use client';

import { normalizeWalletAddress } from '@/lib/wallet-utils';
import { db } from '@/repository/db/config/client';
import type { User } from '@/repository/db/database';
import { get, onValue, ref, update } from 'firebase/database';

interface DisplayUser extends Pick<User, 'username'> {
  id: string; // ウォレットアドレス (UIのkey用)
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
  const normalizedAddress = normalizeWalletAddress(walletAddress);
  const userRef = ref(db, `${USERS_PATH}/${normalizedAddress}`);
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
  data: Partial<Omit<User, 'createdAt'>>,
): Promise<void> => {
  const normalizedAddress = normalizeWalletAddress(walletAddress);
  const userRef = ref(db, `${USERS_PATH}/${normalizedAddress}`);
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
  const normalizedAddress = normalizeWalletAddress(walletAddress);
  const normalizedFriendId = normalizeWalletAddress(friendId);
  const updates = {
    [`${USERS_PATH}/${normalizedAddress}/friends/${normalizedFriendId}`]: {
      createdAt: timestamp,
    },
    [`${USERS_PATH}/${normalizedFriendId}/friends/${normalizedAddress}`]: {
      createdAt: timestamp,
    },
    [`${USERS_PATH}/${normalizedAddress}/updatedAt`]: timestamp,
    [`${USERS_PATH}/${normalizedFriendId}/updatedAt`]: timestamp,
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
  const normalizedAddress = normalizeWalletAddress(walletAddress);
  const normalizedFriendId = normalizeWalletAddress(friendId);
  const updates = {
    [`${USERS_PATH}/${normalizedAddress}/friends/${normalizedFriendId}`]: null,
    [`${USERS_PATH}/${normalizedFriendId}/friends/${normalizedAddress}`]: null,
    [`${USERS_PATH}/${normalizedAddress}/updatedAt`]: timestamp,
    [`${USERS_PATH}/${normalizedFriendId}/updatedAt`]: timestamp,
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
  walletAddress: string,
  section: 'friend' | 'other',
): DisplayUser => {
  return {
    id: walletAddress,
    username: user.username,
    displayName: user.username,
    walletAddress: walletAddress,
    avatar: user.imageUrl || '/icons/faceIcon-192x192.png',
    section,
  };
};
