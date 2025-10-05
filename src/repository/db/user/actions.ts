'use server';

import { getCurrentTimestamp } from '@/lib/utils';
import { adminDbRef } from '@/repository/db/config/server';
import type { User } from '@/repository/db/database';
import type { ProfileForm } from './schema';

const USERS_PATH = 'users';

/**
 * 新しいユーザーを作成する
 * @param data プロフィール情報（username, bio, imageUrl）
 * @param walletAddress ウォレットアドレス
 * @returns 作成されたユーザー情報
 * @throws {Error} データベースエラー時
 */
export async function createUser(data: ProfileForm, walletAddress: string) {
  const timestamp = getCurrentTimestamp();
  const userRef = adminDbRef(`${USERS_PATH}/${walletAddress}`);

  const user: User = {
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
 * @param walletAddress ウォレットアドレス
 * @returns ユーザー情報（存在しない場合はnull）
 * @throws {Error} データベースエラー時
 */
export async function getUser(walletAddress: string) {
  const snapshot = await adminDbRef(`${USERS_PATH}/${walletAddress}`).get();
  return snapshot.val() as User | null;
}

/**
 * ユーザー情報を更新する
 * @param walletAddress ウォレットアドレス
 * @param data 更新するデータ（idとcreatedAtは除く）
 * @returns 更新されたデータ
 * @throws {Error} データベースエラー時
 * @description usernameまたはimageUrlが更新された場合、チャットルーム内の情報も自動更新される
 */
export async function updateUser(
  walletAddress: string,
  data: Partial<Omit<User, 'id' | 'createdAt'>>,
) {
  const timestamp = getCurrentTimestamp();
  const updates = {
    ...data,
    updatedAt: timestamp,
  };

  // ユーザー情報を更新
  await adminDbRef(`${USERS_PATH}/${walletAddress}`).update(updates);

  // 新しいスキーマでは、チャットルームのメンバー情報は最小限（joinedAt, lastReadAt）のみ
  // usernameやimageUrlはUserテーブルから取得するため、チャットルームの更新は不要

  return updates;
}

/**
 * ユーザーを削除する
 * @param walletAddress ウォレットアドレス
 * @throws {Error} データベースエラー時
 */
export async function deleteUser(walletAddress: string) {
  await adminDbRef(`${USERS_PATH}/${walletAddress}`).remove();
}

/**
 * すべてのユーザー情報を取得する
 * @returns 全ユーザーの配列
 * @throws {Error} データベースエラー時
 */
export async function getAllUsers(): Promise<
  Array<User & { walletAddress: string }>
> {
  const snapshot = await adminDbRef(USERS_PATH).get();
  const users: Record<string, User> = snapshot.val() || {};
  // ウォレットアドレス（キー）とユーザーデータを組み合わせて返す
  return Object.entries(users).map(([walletAddress, user]) => ({
    ...user,
    walletAddress, // ユーザーのidフィールドを優先使用
  }));
}

/**
 * 指定されたIDのユーザー情報を取得する（getUserのエイリアス）
 * @param id ウォレットアドレス
 * @returns ユーザー情報（存在しない場合はnull）
 * @throws {Error} データベースエラー時
 */
export async function getUserById(id: string) {
  const snapshot = await adminDbRef(`${USERS_PATH}/${id}`).get();
  return snapshot.val() as User | null;
}

/**
 * 指定されたIDのユーザーが存在するかチェックする
 * @param id ウォレットアドレス
 * @returns 存在する場合はtrue、存在しない場合はfalse
 * @throws {Error} データベースエラー時
 */
export async function isIdExists(id: string): Promise<boolean> {
  const user = await getUserById(id);
  return user !== null;
}

/**
 * フレンド関係を追加する（双方向）
 * @param walletAddress ウォレットアドレス
 * @param friendId フレンドのID（ウォレットアドレス）
 * @throws {Error} ユーザーが存在しない場合、既にフレンドの場合、データベースエラー時
 */
export async function addFriend(
  walletAddress: string,
  friendId: string,
): Promise<void> {
  const timestamp = getCurrentTimestamp();

  // バリデーション
  const [user, friend] = await Promise.all([
    getUserById(walletAddress),
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
    [`${USERS_PATH}/${walletAddress}/friends/${friendId}`]: {
      createdAt: timestamp,
    },
    [`${USERS_PATH}/${friendId}/friends/${walletAddress}`]: {
      createdAt: timestamp,
    },
    [`${USERS_PATH}/${walletAddress}/updatedAt`]: timestamp,
    [`${USERS_PATH}/${friendId}/updatedAt`]: timestamp,
  };

  await adminDbRef('/').update(updates);
}

/**
 * フレンド関係を削除する（双方向）
 * @param walletAddress ウォレットアドレス
 * @param friendId フレンドのID（ウォレットアドレス）
 * @throws {Error} ユーザーが存在しない場合、フレンド関係が存在しない場合、データベースエラー時
 */
export async function removeFriend(
  walletAddress: string,
  friendId: string,
): Promise<void> {
  const timestamp = getCurrentTimestamp();

  // バリデーション
  const [user, friend] = await Promise.all([
    getUserById(walletAddress),
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
    [`${USERS_PATH}/${walletAddress}/friends/${friendId}`]: null,
    [`${USERS_PATH}/${friendId}/friends/${walletAddress}`]: null,
    [`${USERS_PATH}/${walletAddress}/updatedAt`]: timestamp,
    [`${USERS_PATH}/${friendId}/updatedAt`]: timestamp,
  };

  await adminDbRef('/').update(updates);
}

/**
 * ユーザーのフレンド一覧を取得する
 * @param walletAddress ウォレットアドレス
 * @returns フレンド一覧（更新日時降順でソート）
 * @throws {Error} ユーザーが存在しない場合、データベースエラー時
 */
export async function getUserFriends(
  walletAddress: string,
): Promise<Array<User & { walletAddress: string }>> {
  const user = await getUserById(walletAddress);
  if (!user) {
    throw new Error('User not found');
  }

  if (!user.friends) {
    return [];
  }

  const friendIds = Object.keys(user.friends);
  const friends = await Promise.all(
    friendIds.map(async (friendId) => {
      const friend = await getUserById(friendId);
      return friend ? { ...friend, walletAddress: friendId } : null;
    }),
  );

  return friends
    .filter(
      (friend): friend is User & { walletAddress: string } => friend !== null,
    )
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * 自分以外のユーザー一覧を取得する
 * @param currentWalletAddress 現在のウォレットアドレス
 * @returns 自分以外のユーザー一覧
 * @throws {Error} データベースエラー時
 */
export async function getOtherUsers(
  currentWalletAddress: string,
): Promise<Array<User & { walletAddress: string }>> {
  const allUsers = await getAllUsers();
  return allUsers.filter((user) => user.walletAddress !== currentWalletAddress);
}

/**
 * フレンド状態を含むユーザー一覧を取得する
 * @param currentWalletAddress 現在のウォレットアドレス
 * @returns フレンドとその他のユーザー一覧（更新日時降順でソート）
 * @throws {Error} データベースエラー時
 */
export async function getUsersWithFriendship(
  currentWalletAddress: string,
): Promise<{
  friends: Array<User & { walletAddress: string }>;
  others: Array<User & { walletAddress: string }>;
}> {
  const [currentUser, otherUsers] = await Promise.all([
    getUserById(currentWalletAddress),
    getOtherUsers(currentWalletAddress),
  ]);

  if (!currentUser) return { friends: [], others: [] };

  const friends: Array<User & { walletAddress: string }> = [];
  const others: Array<User & { walletAddress: string }> = [];

  // 友達かどうかで振り分け
  otherUsers.forEach((user) => {
    if (currentUser.friends?.[user.walletAddress]) {
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

/**
 * Farcaster情報から自動的にユーザーを作成する
 * @param userData ユーザー情報（id + ProfileForm）
 * @throws {Error} ユーザー作成に失敗した場合
 */
export async function autoCreateUserFromFarcaster(
  userData: ProfileForm,
  walletAddress: string,
): Promise<void> {
  if (!walletAddress) {
    console.error('❌ Wallet address is required');
    throw new Error('Wallet address is required');
  }

  try {
    await createUser(userData, walletAddress);
  } catch (error) {
    console.error('Failed to auto-create user from Farcaster:', error);
    throw new Error(
      `Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
