import { ProfileEditPage } from '@/components/pages/profileEditPage';
export const dynamic = 'force-dynamic';
import { getPrivyId } from '@/lib/auth';
import { getUser } from '@/repository/user/actions';
import { redirect } from 'next/navigation';

export default async function Page() {
  const userId = await getPrivyId();
  if (!userId) {
    redirect('/');
  }

  const user = await getUser(userId);
  if (!user) {
    redirect('/');
  }

  return <ProfileEditPage initialUser={user} />;
}
