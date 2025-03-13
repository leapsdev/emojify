import { adminDbRef } from '@/lib/firebase/admin';
import { getCurrentTimestamp } from '@/utils/date';
import type { ProfileForm, User } from './schema';

const USERS_PATH = 'users';

export async function createUser(data: ProfileForm, privyId: string) {
  const timestamp = getCurrentTimestamp();
  const newUserRef = adminDbRef(USERS_PATH).push();

  const user: User = {
    id: newUserRef.key || '',
    privyId,
    email: data.email,
    username: data.username,
    bio: data.bio ?? null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await newUserRef.set(user);
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

  await adminDbRef(`${USERS_PATH}/${userId}`).update(updates);
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

export async function getUserByPrivyId(privyId: string) {
  const snapshot = await adminDbRef(USERS_PATH)
    .orderByChild('privyId')
    .equalTo(privyId)
    .once('value');

  const users = snapshot.val();
  if (!users) return null;

  // privyIdは一意なので、最初のユーザーを返す
  const userId = Object.keys(users)[0];
  return users[userId] as User;
}

export async function isPrivyIdExists(privyId: string): Promise<boolean> {
  const user = await getUserByPrivyId(privyId);
  return user !== null;
}
