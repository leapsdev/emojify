'use client';

import { db } from '@/repository/db/config/client';
import type { User } from '@/repository/db/database';
import { get, onValue, ref, update } from 'firebase/database';

interface DisplayUser extends Pick<User, 'id' | 'username'> {
  displayName: string;
  userId: string;
  avatar: string;
  section: 'friend' | 'other';
}

const USERS_PATH = 'users';

/**
 * ユーザー情報を取得
 */
export const getUser = async (userId: string): Promise<User | null> => {
  const userRef = ref(db, `${USERS_PATH}/${userId}`);
  const snapshot = await get(userRef);
  return snapshot.val();
};

/**
 * ユーザー情報を更新
 */
export const updateUser = async (
  userId: string,
  data: Partial<Omit<User, 'id' | 'createdAt'>>,
): Promise<void> => {
  const userRef = ref(db, `${USERS_PATH}/${userId}`);
  await update(userRef, data);
};

/**
 * フレンドを追加
 */
export const addFriend = async (
  userId: string,
  friendId: string,
): Promise<void> => {
  const timestamp = Date.now();
  const updates = {
    [`${USERS_PATH}/${userId}/friends/${friendId}`]: { createdAt: timestamp },
    [`${USERS_PATH}/${friendId}/friends/${userId}`]: { createdAt: timestamp },
    [`${USERS_PATH}/${userId}/updatedAt`]: timestamp,
    [`${USERS_PATH}/${friendId}/updatedAt`]: timestamp,
  };
  await update(ref(db), updates);
};

/**
 * フレンドを削除
 */
export const removeFriend = async (
  userId: string,
  friendId: string,
): Promise<void> => {
  const timestamp = Date.now();
  const updates = {
    [`${USERS_PATH}/${userId}/friends/${friendId}`]: null,
    [`${USERS_PATH}/${friendId}/friends/${userId}`]: null,
    [`${USERS_PATH}/${userId}/updatedAt`]: timestamp,
    [`${USERS_PATH}/${friendId}/updatedAt`]: timestamp,
  };
  await update(ref(db), updates);
};

/**
 * ユーザーリストの変更を監視
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
 * ユーザーをDisplayUser形式に変換
 */
export const convertToDisplayUser = (
  user: User,
  section: 'friend' | 'other',
): DisplayUser => {
  return {
    id: user.id,
    username: user.username,
    displayName: user.username,
    userId: user.id,
    avatar: user.imageUrl || '/icons/faceIcon-192x192.png',
    section,
  };
};
