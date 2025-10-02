'use server';

import { getCurrentTimestamp } from '@/lib/utils';
import { adminDbRef } from '@/repository/db/config/server';
import type { User } from '@/repository/db/database';
import type { ProfileForm } from './schema';

const USERS_PATH = 'users';

/**
 * 新しいユーザーを作成する
 * @param data プロフィール情報（username, bio, imageUrl）
 * @param userId ユーザーID（ウォレットアドレス）
 * @returns 作成されたユーザー情報
 * @throws {Error} データベースエラー時
 */
export async function createUser(data: ProfileForm, userId: string) {
  const timestamp = getCurrentTimestamp();
  const userRef = adminDbRef(`${USERS_PATH}/${userId}`);

  const user: User = {
    id: userId,
    username: data.username,
    bio: data.bio || null,
    imageUrl: data.imageUrl || null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await userRef.set(user);
  return user;
}

/**
 * 指定されたユーザーIDのユーザー情報を取得する
 * @param userId ユーザーID（ウォレットアドレス）
 * @returns ユーザー情報（存在しない場合はnull）
 * @throws {Error} データベースエラー時
 */
export async function getUser(userId: string) {
  const snapshot = await adminDbRef(`${USERS_PATH}/${userId}`).get();
  return snapshot.val() as User | null;
}

/**
 * ユーザー情報を更新する
 * @param userId ユーザーID（ウォレットアドレス）
 * @param data 更新するデータ（idとcreatedAtは除く）
 * @returns 更新されたデータ
 * @throws {Error} データベースエラー時
 * @description usernameまたはimageUrlが更新された場合、チャットルーム内の情報も自動更新される
 */
export async function updateUser(
  userId: string,
  data: Partial<Omit<User, 'id' | 'createdAt'>>,
) {
  const timestamp = getCurrentTimestamp();
  const updates = {
    ...data,
    updatedAt: timestamp,
  };

  // ユーザー情報を更新
  await adminDbRef(`${USERS_PATH}/${userId}`).update(updates);

  // 新しいスキーマでは、チャットルームのメンバー情報は最小限（joinedAt, lastReadAt）のみ
  // usernameやimageUrlはUserテーブルから取得するため、チャットルームの更新は不要

  return updates;
}

/**
 * ユーザーを削除する
 * @param userId ユーザーID（ウォレットアドレス）
 * @throws {Error} データベースエラー時
 */
export async function deleteUser(userId: string) {
  await adminDbRef(`${USERS_PATH}/${userId}`).remove();
}

/**
 * すべてのユーザー情報を取得する
 * @returns 全ユーザーの配列
 * @throws {Error} データベースエラー時
 */
export async function getAllUsers() {
  const snapshot = await adminDbRef(USERS_PATH).get();
  const users: Record<string, User> = snapshot.val() || {};
  return Object.values(users);
}

/**
 * 指定されたIDのユーザー情報を取得する（getUserのエイリアス）
 * @param id ユーザーID（ウォレットアドレス）
 * @returns ユーザー情報（存在しない場合はnull）
 * @throws {Error} データベースエラー時
 */
export async function getUserById(id: string) {
  const snapshot = await adminDbRef(`${USERS_PATH}/${id}`).get();
  return snapshot.val() as User | null;
}

/**
 * 指定されたIDのユーザーが存在するかチェックする
 * @param id ユーザーID（ウォレットアドレス）
 * @returns 存在する場合はtrue、存在しない場合はfalse
 * @throws {Error} データベースエラー時
 */
export async function isIdExists(id: string): Promise<boolean> {
  const user = await getUserById(id);
  return user !== null;
}

/**
 * フレンド関係を追加する（双方向）
 * @param userId ユーザーID（ウォレットアドレス）
 * @param friendId フレンドのID（ウォレットアドレス）
 * @throws {Error} ユーザーが存在しない場合、既にフレンドの場合、データベースエラー時
 */
export async function addFriend(
  userId: string,
  friendId: string,
): Promise<void> {
  const timestamp = getCurrentTimestamp();

  // バリデーション
  const [user, friend] = await Promise.all([
    getUserById(userId),
    getUserById(friendId),
  ]);

  if (!user || !friend) {
    throw new Error('User not found');
  }

  if (user.friends?.[friendId]) {
    throw new Error('Already friends');
  }

  // 双方向のフレンド関係を更新
  const updates = {
    [`${USERS_PATH}/${userId}/friends/${friendId}`]: { createdAt: timestamp },
    [`${USERS_PATH}/${friendId}/friends/${userId}`]: { createdAt: timestamp },
    [`${USERS_PATH}/${userId}/updatedAt`]: timestamp,
    [`${USERS_PATH}/${friendId}/updatedAt`]: timestamp,
  };

  await adminDbRef('/').update(updates);
}

/**
 * フレンド関係を削除する（双方向）
 * @param userId ユーザーID（ウォレットアドレス）
 * @param friendId フレンドのID（ウォレットアドレス）
 * @throws {Error} ユーザーが存在しない場合、フレンド関係が存在しない場合、データベースエラー時
 */
export async function removeFriend(
  userId: string,
  friendId: string,
): Promise<void> {
  const timestamp = getCurrentTimestamp();

  // バリデーション
  const [user, friend] = await Promise.all([
    getUserById(userId),
    getUserById(friendId),
  ]);

  if (!user || !friend) {
    throw new Error('User not found');
  }

  if (!user.friends?.[friendId]) {
    throw new Error('Not friends');
  }

  // 双方向のフレンド関係を削除
  const updates = {
    [`${USERS_PATH}/${userId}/friends/${friendId}`]: null,
    [`${USERS_PATH}/${friendId}/friends/${userId}`]: null,
    [`${USERS_PATH}/${userId}/updatedAt`]: timestamp,
    [`${USERS_PATH}/${friendId}/updatedAt`]: timestamp,
  };

  await adminDbRef('/').update(updates);
}

/**
 * ユーザーのフレンド一覧を取得する
 * @param userId ユーザーID（ウォレットアドレス）
 * @returns フレンド一覧（更新日時降順でソート）
 * @throws {Error} ユーザーが存在しない場合、データベースエラー時
 */
export async function getUserFriends(userId: string): Promise<User[]> {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (!user.friends) {
    return [];
  }

  const friendIds = Object.keys(user.friends);
  const friends = await Promise.all(
    friendIds.map((friendId) => getUserById(friendId)),
  );

  return friends
    .filter((friend): friend is User => friend !== null)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * 自分以外のユーザー一覧を取得する
 * @param currentUserId 現在のユーザーID（ウォレットアドレス）
 * @returns 自分以外のユーザー一覧
 * @throws {Error} データベースエラー時
 */
export async function getOtherUsers(currentUserId: string): Promise<User[]> {
  const allUsers = await getAllUsers();
  return allUsers.filter((user) => user.id !== currentUserId);
}

/**
 * フレンド状態を含むユーザー一覧を取得する
 * @param currentUserId 現在のユーザーID（ウォレットアドレス）
 * @returns フレンドとその他のユーザー一覧（更新日時降順でソート）
 * @throws {Error} データベースエラー時
 */
export async function getUsersWithFriendship(currentUserId: string): Promise<{
  friends: User[];
  others: User[];
}> {
  const [currentUser, otherUsers] = await Promise.all([
    getUserById(currentUserId),
    getOtherUsers(currentUserId),
  ]);

  if (!currentUser) return { friends: [], others: [] };

  const friends: User[] = [];
  const others: User[] = [];

  // 友達かどうかで振り分け
  otherUsers.forEach((user) => {
    if (currentUser.friends?.[user.id]) {
      friends.push(user);
    } else {
      others.push(user);
    }
  });

  return {
    friends: friends.sort((a, b) => b.updatedAt - a.updatedAt),
    others: others.sort((a, b) => b.updatedAt - a.updatedAt),
  };
}
