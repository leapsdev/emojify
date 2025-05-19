'use server';

import { getCurrentTimestamp } from '@/lib/date';
import { adminDbRef } from '@/repository/config/server';
import { PrivyClient } from '@privy-io/server-auth';
import { updateUserInChatRooms } from '../chat/actions';

import type { User } from '@/repository/database';
import type { LinkedAccountWithMetadata } from '@privy-io/server-auth';
import type { ProfileForm } from './schema';

const USERS_PATH = 'users';

export async function createUser(data: ProfileForm, privyId: string) {
  const timestamp = getCurrentTimestamp();
  const userRef = adminDbRef(`${USERS_PATH}/${privyId}`);

  const user: User = {
    id: privyId,
    username: data.username,
    bio: data.bio || null,
    imageUrl: data.imageUrl || null,
    createdAt: timestamp,
    updatedAt: timestamp,
    email: data.email || null,
  };

  await userRef.set(user);
  return user;
}

export async function getUser(userId: string) {
  const snapshot = await adminDbRef(`${USERS_PATH}/${userId}`).get();
  return snapshot.val() as User | null;
}

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

  // ユーザー名またはimageUrlが更新された場合、チャットルーム内の情報も更新
  if (data.username || data.imageUrl !== undefined) {
    const chatRoomUpdates: Partial<Pick<User, 'username' | 'imageUrl'>> = {
      ...(data.username && { username: data.username }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
    };
    await updateUserInChatRooms(
      userId,
      chatRoomUpdates as Pick<User, 'username' | 'imageUrl'>,
    );
  }

  return updates;
}

export async function deleteUser(userId: string) {
  await adminDbRef(`${USERS_PATH}/${userId}`).remove();
}

export async function getAllUsers() {
  const snapshot = await adminDbRef(USERS_PATH).get();
  const users: Record<string, User> = snapshot.val() || {};
  return Object.values(users);
}

export async function getUserById(id: string) {
  const snapshot = await adminDbRef(`${USERS_PATH}/${id}`).get();
  return snapshot.val() as User | null;
}

export async function isIdExists(id: string): Promise<boolean> {
  const user = await getUserById(id);
  return user !== null;
}

/**
 * フレンドを追加
 * @param userId ユーザーID
 * @param friendId フレンドのID
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
 * フレンドを削除
 * @param userId ユーザーID
 * @param friendId フレンドのID
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
 * ユーザーのフレンド一覧を取得
 * @param userId ユーザーID
 * @returns フレンド一覧
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
 * 自分以外のユーザー一覧を取得
 * @param currentUserId 現在のユーザーID
 * @returns 自分以外のユーザー一覧
 */
export async function getOtherUsers(currentUserId: string): Promise<User[]> {
  const allUsers = await getAllUsers();
  return allUsers.filter((user) => user.id !== currentUserId);
}

/**
 * 友達状態を含むユーザー一覧を取得
 * @param currentUserId 現在のユーザーID
 * @returns フレンドとその他のユーザー一覧
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

/**
 * ユーザーのウォレットアドレスを取得する
 * @param userId ユーザーID
 * @returns ウォレットアドレスの配列
 */
export async function getWalletAddresses(userId: string): Promise<string[]> {
  const privy = new PrivyClient(
    process.env.NEXT_PUBLIC_PRIVY_APP_ID || '',
    process.env.PRIVY_APP_SECRET || '',
  );

  try {
    const user = await privy.getUser(userId);
    return user.linkedAccounts
      .filter(
        (account): account is LinkedAccountWithMetadata & { type: 'wallet' } =>
          account.type === 'wallet',
      )
      .map((account) => account.address);
  } catch (error) {
    console.error('Error fetching user wallet addresses:', error);
    return [];
  }
}
