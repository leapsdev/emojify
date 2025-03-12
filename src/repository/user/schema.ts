import { z } from 'zod';
import { users } from '../../db/schema';

export const profileFormSchema = z.object({
  email: z.string().email().optional(),
  username: z
    .string({
      required_error: 'ユーザー名は必須です',
    })
    .min(3, 'ユーザー名は3文字以上で入力してください')
    .max(20, 'ユーザー名は20文字以下で入力してください'),
  bio: z
    .string()
    .max(300, 'プロフィールは300文字以下で入力してください')
    .optional(),
});

export { users };
