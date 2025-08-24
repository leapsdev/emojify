'use server';

import { getPrivyId } from '@/lib/auth';
import { isIdExists } from '@/repository/db/user/actions';

export async function checkUserExists(): Promise<boolean> {
  const id = await getPrivyId();
  if (!id) return false;
  const exists = await isIdExists(id);
  return exists;
}
