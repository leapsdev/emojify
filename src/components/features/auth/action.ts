'use server';

import { getPrivyId } from '@/lib/auth';
import { isPrivyIdExists } from '@/repository/user/actions';

export type AuthRedirectPath = '/create-profile' | null;

export async function checkUser(): Promise<AuthRedirectPath | undefined> {
  const privyId = await getPrivyId();
  if (!privyId) return;
  const exists = await isPrivyIdExists(privyId);
  return exists ? null : '/create-profile';
}
