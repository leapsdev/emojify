'use server';

import { createProfile } from '@/repository/user/actions';
import { type ProfileForm, profileFormSchema } from '@/repository/user/schema';
import { parseWithZod } from '@conform-to/zod';
import { redirect } from 'next/navigation';

export type ProfileFormState = {
  message: string;
  status: 'error' | 'success';
} | null;

export async function handleProfileFormAction(
  state: ProfileFormState,
  formData?: FormData,
): Promise<ProfileFormState> {
  if (!formData) return null;
  const submission = parseWithZod(formData, {
    schema: profileFormSchema,
  });

  if (submission.status === 'error') {
    if (!submission.error) {
      return {
        message: 'バリデーションエラーが発生しました',
        status: 'error' as const,
      };
    }

    const firstError = Object.entries(submission.error).find(
      ([, errors]) => errors && errors.length > 0,
    );

    return {
      message: firstError?.[1]?.[0] || 'バリデーションエラーが発生しました',
      status: 'error' as const,
    };
  }

  const profileData: ProfileForm = {
    email: String(submission.payload.email),
    username: String(submission.payload.username),
    bio: submission.payload.bio ? String(submission.payload.bio) : undefined,
  };

  try {
    await createProfile(profileData);
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : 'エラーが発生しました',
      status: 'error' as const,
    };
  }

  redirect('/chat');
}
