'use server';

import { updateUser } from '@/repository/db/user/actions';
import { profileFormSchema } from '@/repository/db/user/schema';
import { parseWithZod } from '@conform-to/zod';
import { redirect } from 'next/navigation';

export type ProfileFormState = {
  message: string;
  status: 'error' | 'success';
} | null;

export async function handleProfileFormAction(
  _state: ProfileFormState,
  formData?: FormData,
): Promise<ProfileFormState> {
  if (!formData) return null;

  // walletAddress を formData から取得（統合認証対応）
  const walletAddress = formData.get('walletAddress') as string;
  if (!walletAddress) {
    return {
      message: 'Failed to get authentication information',
      status: 'error' as const,
    };
  }

  const submission = parseWithZod(formData, {
    schema: profileFormSchema,
  });

  if (submission.status === 'error') {
    if (!submission.error) {
      return {
        message: 'A validation error occurred',
        status: 'error' as const,
      };
    }

    const firstError = Object.entries(submission.error).find(
      ([, errors]) => errors && errors.length > 0,
    );

    return {
      message: firstError?.[1]?.[0] || 'A validation error occurred',
      status: 'error' as const,
    };
  }

  const profileData = {
    username: String(submission.payload.username),
    bio: submission.payload.bio ? String(submission.payload.bio) : null,
    imageUrl: submission.payload.imageUrl
      ? String(submission.payload.imageUrl)
      : null,
  };

  try {
    await updateUser(walletAddress, profileData);
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : 'An error occurred',
      status: 'error' as const,
    };
  }

  redirect('/chat');
}
