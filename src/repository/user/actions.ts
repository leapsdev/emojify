import { adminDbRef } from '@/lib/firebase/admin';
import { getCurrentTimestamp } from '@/utils/date';
import type { ProfileForm, User } from './schema';

const USERS_PATH = 'users';

export async function createProfile(data: ProfileForm, privyId: string) {
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

export async function getProfile(userId: string) {
  const snapshot = await adminDbRef(`${USERS_PATH}/${userId}`).get();
  return snapshot.val() as User | null;
}

export async function updateProfile(
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

export async function deleteProfile(userId: string) {
  await adminDbRef(`${USERS_PATH}/${userId}`).remove();
}

export async function getAllProfiles() {
  const snapshot = await adminDbRef(USERS_PATH).get();
  const users: Record<string, User> = snapshot.val() || {};
  return Object.values(users);
}

export async function getProfileByPrivyId(privyId: string) {
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
