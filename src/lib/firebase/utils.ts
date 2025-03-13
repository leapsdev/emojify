import { get, push, ref, remove, set, update } from 'firebase/database';
import { db } from './client';

/**
 * データを設定（上書き）
 */
export const setData = async <T>(path: string, data: T): Promise<void> => {
  const reference = ref(db, path);
  await set(reference, data);
};

/**
 * データを取得
 */
export const getData = async <T>(path: string): Promise<T | null> => {
  const reference = ref(db, path);
  const snapshot = await get(reference);
  return snapshot.val();
};

/**
 * 新しいデータをプッシュ（一意のキーを生成）
 */
export const pushData = async <T>(
  path: string,
  data: T,
): Promise<string | null> => {
  const reference = ref(db, path);
  const newRef = push(reference);
  await set(newRef, data);
  return newRef.key;
};

/**
 * データを更新（部分的な更新）
 */
export const updateData = async <T extends Record<string, unknown>>(
  path: string,
  updates: Partial<T>,
): Promise<void> => {
  const reference = ref(db, path);
  await update(reference, updates);
};

/**
 * データを削除
 */
export const deleteData = async (path: string) => {
  const reference = ref(db, path);
  await remove(reference);
};
