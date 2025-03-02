'use server';

import { eq, like } from 'drizzle-orm';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { getPrivyId } from '@/lib/auth';
import { db } from '@/db';
import { users } from './schema';
import { CreateProfileInput, SearchUsersInput, UpdateProfileInput } from './types';

export type DBUser = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

/**
 * 現在のユーザーを取得する
 * @throws {Error} 未認証の場合
 */
const getCurrentUser = async () => {
  const userId = await getPrivyId();
  if (!userId) throw new Error('認証が必要です');
  return { id: userId };
};

/**
 * プロフィールを作成する
 */
export async function createProfile(data: CreateProfileInput): Promise<DBUser> {
  const currentUser = await getCurrentUser();
  
  const now = new Date();
  const result =  db.insert(users).values({
    id: currentUser.id,
    username: data.username ?? null,
    profileImageUrl: data.profileImageUrl ?? null,
    address: data.address ?? null,
    createdAt: now,
    updatedAt: now,
  }).returning().get();

  if (!result) throw new Error('プロフィールの作成に失敗しました');
  return result;
}

/**
 * 現在のユーザーのプロフィールを取得する
 */
export async function getProfile(): Promise<DBUser | null> {
  const currentUser = await getCurrentUser();

  const result = db.select().from(users)
    .where(eq(users.id, currentUser.id))
    .get();

  return result ?? null;
}

/**
 * プロフィールを更新する
 */
export async function updateProfile(data: UpdateProfileInput): Promise<DBUser> {
  const currentUser = await getCurrentUser();

  const result = db.update(users)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(users.id, currentUser.id))
    .returning()
    .get();

  if (!result) throw new Error('プロフィールの更新に失敗しました');
  return result;
}

/**
 * プロフィールを削除する
 */
export async function deleteProfile(): Promise<void> {
  const currentUser = await getCurrentUser();

  db.delete(users)
    .where(eq(users.id, currentUser.id))
    .run();
}

/**
 * ユーザーを検索する
 */
export async function searchUsers(input: SearchUsersInput): Promise<DBUser[]> {
  await getCurrentUser(); // 認証チェック

  const { query, limit = 10, offset = 0 } = input;

  const results = db.select()
    .from(users)
    .where(like(users.username, `%${query}%`))
    .limit(limit)
    .offset(offset)
    .all();

  return results;
}
