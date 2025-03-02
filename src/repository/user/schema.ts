import { users } from '../../db/schema';
import { z } from 'zod';

export const profileFormSchema = z.object({
  username: z.string({
    required_error: 'ユーザー名は必須です',
  })
    .min(3, 'ユーザー名は3文字以上で入力してください')
    .max(20, 'ユーザー名は20文字以下で入力してください'),
  displayName: z.string()
    .max(50, '表示名は50文字以下で入力してください')
    .optional(),
  bio: z.string()
    .max(300, 'プロフィールは300文字以下で入力してください')
    .optional(),
});

export { users };
