/**
 * ユーザー関連のZodスキーマ定義
 * @description ユーザーデータのバリデーションと型安全性を提供
 */

import { z } from 'zod';

/**
 * プロフィールフォーム用のスキーマ
 * @description ユーザープロフィール作成・編集時のバリデーション
 */
export const profileFormSchema = z.object({
  username: z.string().min(3).max(20),
  bio: z.string().max(500).nullable().optional(),
  imageUrl: z.string().nullable().optional(),
});

/**
 * プロフィールフォームの型
 */
export type ProfileForm = z.infer<typeof profileFormSchema>;

/**
 * ユーザーデータ用のスキーマ
 * @description データベースに保存されるユーザー情報のバリデーション
 */
export const userSchema = z.object({
  id: z.string(), // 主キー（中身はウォレットアドレス）
  username: z.string(),
  bio: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
  friends: z
    .record(
      z.object({
        createdAt: z.number(),
      }),
    )
    .optional(),
});

/**
 * ユーザーデータの型
 */
export type User = z.infer<typeof userSchema>;
