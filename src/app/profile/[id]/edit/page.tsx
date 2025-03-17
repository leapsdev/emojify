import { getPrivyId } from '@/lib/auth';
import { getUser } from '@/repository/user/actions';
import { ProfileEditPage } from '../../../../components/pages/profileEditPage';
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

  return <ProfileEditPage initialUser={userData} />;
}
