'use server';

import { eq, like } from 'drizzle-orm';
import { db } from '@/db';
import { users } from './schema';
import { CreateProfileInput, SearchUsersInput, UpdateProfileInput, User } from './types';
import { auth } from '@/lib/auth';

/**
 * 現在のユーザーを取得する
 * @throws {Error} 未認証の場合
 */
const getCurrentUser = async () => {
  const user = await auth.getCurrentUser();
  if (!user) throw new Error('認証が必要です');
  return user;
};

/**
 * プロフィールを作成する
 */
export async function createProfile(data: CreateProfileInput): Promise<User> {
  const currentUser = await getCurrentUser();
  
  const now = new Date();
  const newUser = await db.insert(users).values({
    id: currentUser.id,
    username: data.username ?? null,
    profileImageUrl: data.profileImageUrl ?? null,
    address: data.address ?? null,
    createdAt: now,
    updatedAt: now,
  }).returning().get();

  return {
    ...newUser,
    createdAt: new Date(newUser.createdAt),
    updatedAt: new Date(newUser.updatedAt),
  };
}

/**
 * 現在のユーザーのプロフィールを取得する
 */
export async function getProfile(): Promise<User | null> {
  const currentUser = await getCurrentUser();

  const user = await db.select().from(users)
    .where(eq(users.id, currentUser.id))
    .get();

  if (!user) return null;

  return {
    ...user,
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt),
  };
}

/**
 * プロフィールを更新する
 */
export async function updateProfile(data: UpdateProfileInput): Promise<User> {
  const currentUser = await getCurrentUser();

  const updatedUser = await db.update(users)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(users.id, currentUser.id))
    .returning()
    .get();

  return {
    ...updatedUser,
    createdAt: new Date(updatedUser.createdAt),
    updatedAt: new Date(updatedUser.updatedAt),
  };
}

/**
 * プロフィールを削除する
 */
export async function deleteProfile(): Promise<void> {
  const currentUser = await getCurrentUser();

  await db.delete(users)
    .where(eq(users.id, currentUser.id))
    .run();
}

/**
 * ユーザーを検索する
 */
export async function searchUsers(input: SearchUsersInput): Promise<User[]> {
  await getCurrentUser(); // 認証チェック

  const { query, limit = 10, offset = 0 } = input;

  const searchResults = await db.select()
    .from(users)
    .where(like(users.username, `%${query}%`))
    .limit(limit)
    .offset(offset)
    .all();

  return searchResults.map(user => ({
    ...user,
    createdAt: new Date(user.createdAt),
    updatedAt: new Date(user.updatedAt),
  }));
}
