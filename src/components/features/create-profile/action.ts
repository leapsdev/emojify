'use server';

import {
  createFarcasterUser,
  createPrivyUser,
} from '@/repository/db/user/actions';
import {
  type ProfileForm,
  profileFormSchema,
} from '@/repository/db/user/schema';
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

  const userId = formData.get('userId') as string;
  const isMiniAppValue = formData.get('isMiniApp') as string;
  const isMiniApp = isMiniAppValue === 'true';

  console.log('userId', userId);
  if (!userId) {
    return {
      message: '認証情報が不足しています',
      status: 'error' as const,
    };
  }

  const submission = parseWithZod(formData, {
    schema: profileFormSchema,
  });

  if (submission.status === 'error') {
    if (!submission.error) {
      return {
        message: 'A validation error has occurred',
        status: 'error' as const,
      };
    }

    const firstError = Object.entries(submission.error).find(
      ([, errors]) => errors && errors.length > 0,
    );

    return {
      message: firstError?.[1]?.[0] || 'A validation error has occurred',
      status: 'error' as const,
    };
  }

  const profileData: ProfileForm = {
    username: String(submission.payload.username),
    bio: submission.payload.bio ? String(submission.payload.bio) : null,
    imageUrl: submission.payload.imageUrl
      ? String(submission.payload.imageUrl)
      : null,
  };

  try {
    if (isMiniApp) {
      // Farcasterユーザーの場合（数値文字列）
      await createFarcasterUser(profileData, userId);
    } else {
      // Privyユーザーの場合
      await createPrivyUser(profileData, userId);
    }
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : 'An error has occurred',
      status: 'error' as const,
    };
  }

  redirect('/choose-friends');
}
