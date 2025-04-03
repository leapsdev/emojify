import { ProfilePage } from '@/components/pages/profilePage';
export const dynamic = 'force-dynamic';
import { getUserById } from '@/repository/user/actions';
import { redirect } from 'next/navigation';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function Page({ params }: PageProps) {
  const decodedParams = await params;
  const targetUserId = decodeURIComponent(decodedParams.id);
  const targetUser = await getUserById(targetUserId);
  if (!targetUser) {
    redirect('/choose-friends');
  }

  return <ProfilePage user={targetUser} isOwnProfile={false} />;
}
