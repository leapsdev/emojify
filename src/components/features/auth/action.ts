'use server';

import { getPrivyId } from '@/lib/auth';
import { isIdExists } from '@/repository/user/actions';

export type AuthRedirectPath = '/create-profile' | null;

export async function checkUser(): Promise<AuthRedirectPath | undefined> {
  const id = await getPrivyId();
  if (!id) return;
  const exists = await isIdExists(id);
  return exists ? null : '/create-profile';
}
