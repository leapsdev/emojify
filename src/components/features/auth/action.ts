'use server';

import { getPrivyId } from '@/lib/auth';
import { isIdExists } from '@/repository/db/user/actions';

export async function checkUserExists(): Promise<boolean> {
  const id = await getPrivyId();
  console.log('checkUserExists: getPrivyId returned:', id);
  if (!id) {
    console.log('checkUserExists: no privy ID found');
    return false;
  }
  const exists = await isIdExists(id);
  console.log('checkUserExists: isIdExists returned:', exists);
  return exists;
}
