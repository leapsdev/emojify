'use server';

import { db } from '@/db';
import { getPrivyId } from '@/lib/auth';
import { eq, like } from 'drizzle-orm';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { users } from './schema';
import type {
  CreateProfileInput,
  SearchUsersInput,
  UpdateProfileInput,
} from './types';

export type DBUser = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

/**
 * 現在のユーザーを取得する
 * @throws {Error} 未認証の場合
 */
const getCurrentUserId = async () => {
  const userId = await getPrivyId();
  if (!userId) throw new Error('認証が必要です');
  return userId;
};

/**
 * プロフィールを作成する
 */
export async function createProfile(data: CreateProfileInput): Promise<DBUser> {
  const currentUserId = await getCurrentUserId();

  const now = new Date();
  const result = db
    .insert(users)
    .values({
      id: currentUserId,
      username: data.username ?? null,
      profileImageUrl: data.profileImageUrl ?? null,
      address: data.address ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .returning()
    .get();

  if (!result) throw new Error('プロフィールの作成に失敗しました');
  return result;
}

/**
 * 現在のユーザーのプロフィールを取得する
 */
export async function getProfile(): Promise<DBUser | null> {
  const currentUserId = await getCurrentUserId();

  const result = db
    .select()
    .from(users)
    .where(eq(users.id, currentUserId))
    .get();

  return result ?? null;
}

/**
 * プロフィールを更新する
 */
export async function updateProfile(data: UpdateProfileInput): Promise<DBUser> {
  const currentUserId = await getCurrentUserId();

  const result = db
    .update(users)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(users.id, currentUserId))
    .returning()
    .get();

  if (!result) throw new Error('プロフィールの更新に失敗しました');
  return result;
}

/**
 * プロフィールを削除する
 */
export async function deleteProfile(): Promise<void> {
  const currentUserId = await getCurrentUserId();

  db.delete(users).where(eq(users.id, currentUserId)).run();
}

/**
 * ユーザーを検索する
 */
export async function searchUsers(input: SearchUsersInput): Promise<DBUser[]> {
  await getCurrentUserId(); // 認証チェック

  const { query, limit = 10, offset = 0 } = input;

  const results = db
    .select()
    .from(users)
    .where(like(users.username, `%${query}%`))
    .limit(limit)
    .offset(offset)
    .all();

  return results;
}
