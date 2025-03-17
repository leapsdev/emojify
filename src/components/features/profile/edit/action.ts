'use server';

import { updateUser } from '@/repository/user/actions';
import { profileFormSchema } from '@/repository/user/schema';

export type ProfileFormState =
  | {
      status: 'success' | 'error';
      message: string;
    }
  | null;

export async function handleProfileFormAction(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const parsed = profileFormSchema.safeParse({
    email: formData.get('email'),
    username: formData.get('username'),
    bio: formData.get('bio'),
  });

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Invalid form data',
    };
  }

  try {
    const userId = formData.get('userId') as string;
    await updateUser(userId, parsed.data);

    return {
      status: 'success',
      message: 'プロフィールを更新しました',
    };
  } catch {
    return {
      status: 'error',
      message: 'プロフィールの更新に失敗しました',
    };
  }
}
