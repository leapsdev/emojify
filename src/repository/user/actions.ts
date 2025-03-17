import 'server-only';
import { adminDbRef } from '@/lib/firebase/admin';
import type { User } from '@/types/database';
import { getCurrentTimestamp } from '@/utils/date';
import type { ProfileForm } from './schema';

const USERS_PATH = 'users';

export async function createUser(data: ProfileForm, privyId: string) {
  const timestamp = getCurrentTimestamp();
  const cleanId = privyId.replace('did:privy:', '');
  const userRef = adminDbRef(`${USERS_PATH}/${cleanId}`);

  const user: User = {
    id: cleanId,
    email: data.email,
    username: data.username,
    bio: data.bio ?? null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await userRef.set(user);
  return user;
}

export async function getUser(userId: string) {
  const cleanId = userId.replace('did:privy:', '');
  const snapshot = await adminDbRef(`${USERS_PATH}/${cleanId}`).get();
  return snapshot.val() as User | null;
}

export async function updateUser(
  userId: string,
  data: Partial<Omit<User, 'id' | 'createdAt'>>,
) {
  const timestamp = getCurrentTimestamp();
  const cleanId = userId.replace('did:privy:', '');
  const updates = {
    ...data,
    updatedAt: timestamp,
  };

  await adminDbRef(`${USERS_PATH}/${cleanId}`).update(updates);
  return updates;
}

export async function deleteUser(userId: string) {
  const cleanId = userId.replace('did:privy:', '');
  await adminDbRef(`${USERS_PATH}/${cleanId}`).remove();
}

export async function getAllUsers() {
  const snapshot = await adminDbRef(USERS_PATH).get();
  const users: Record<string, User> = snapshot.val() || {};
  return Object.values(users);
}

export async function getUserById(id: string) {
  const cleanId = id.replace('did:privy:', '');
  const snapshot = await adminDbRef(`${USERS_PATH}/${cleanId}`).get();
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
  const cleanUserId = userId.replace('did:privy:', '');
  const cleanFriendId = friendId.replace('did:privy:', '');

  // バリデーション
  const [user, friend] = await Promise.all([
    getUserById(cleanUserId),
    getUserById(cleanFriendId),
  ]);

  if (!user || !friend) {
    throw new Error('User not found');
  }

  if (user.friends?.[friendId]) {
    throw new Error('Already friends');
  }

  // 双方向のフレンド関係を更新
  const updates = {
    [`${USERS_PATH}/${cleanUserId}/friends/${cleanFriendId}`]: { createdAt: timestamp },
    [`${USERS_PATH}/${cleanFriendId}/friends/${cleanUserId}`]: { createdAt: timestamp },
    [`${USERS_PATH}/${cleanUserId}/updatedAt`]: timestamp,
    [`${USERS_PATH}/${cleanFriendId}/updatedAt`]: timestamp,
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
  const cleanUserId = userId.replace('did:privy:', '');
  const cleanFriendId = friendId.replace('did:privy:', '');

  // バリデーション
  const [user, friend] = await Promise.all([
    getUserById(cleanUserId),
    getUserById(cleanFriendId),
  ]);

  if (!user || !friend) {
    throw new Error('User not found');
  }

  if (!user.friends?.[friendId]) {
    throw new Error('Not friends');
  }

  // 双方向のフレンド関係を削除
  const updates = {
    [`${USERS_PATH}/${cleanUserId}/friends/${cleanFriendId}`]: null,
    [`${USERS_PATH}/${cleanFriendId}/friends/${cleanUserId}`]: null,
    [`${USERS_PATH}/${cleanUserId}/updatedAt`]: timestamp,
    [`${USERS_PATH}/${cleanFriendId}/updatedAt`]: timestamp,
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

  if (!currentUser) {
    throw new Error('Current user not found');
  }

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
