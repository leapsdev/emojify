import { ProfilePage } from '@/components/pages/profilePage';
import { getPrivyId } from '@/lib/auth';
import { getUser } from '@/repository/user/actions';
import { redirect } from 'next/navigation';

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
