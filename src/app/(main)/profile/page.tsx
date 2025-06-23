import { ProfilePage } from '@/components/pages/ProfilePage';
import { getPrivyId } from '@/lib/auth';
import { getUser } from '@/repository/db/user/actions';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const privyId = await getPrivyId();
  if (!privyId) {
    redirect('/');
  }

  const userData = await getUser(privyId);
  if (!userData) {
    redirect('/');
  }

  return <ProfilePage user={userData} />;
}
