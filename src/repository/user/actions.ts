import { adminDbRef } from '@/lib/firebase/admin';
import type { ProfileForm, User } from './schema';

const USERS_PATH = 'users';

export async function createProfile(data: ProfileForm) {
  const timestamp = Date.now();
  const newUserRef = adminDbRef(USERS_PATH).push();

  const user: User = {
    id: newUserRef.key || '',
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
  const timestamp = Date.now();
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
