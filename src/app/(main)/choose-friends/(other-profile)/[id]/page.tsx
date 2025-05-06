import { ProfilePage } from '@/components/pages/ProfilePage';
export const dynamic = 'force-dynamic';
import { getPrivyId } from '@/lib/auth';
import { getUserById } from '@/repository/user/actions';
import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const decodedParams = await params;
  const targetUserId = decodeURIComponent(decodedParams.id);

  // 現在のユーザーの取得
  const currentUserId = await getPrivyId();
  if (!currentUserId) {
    redirect('/');
  }

  // 表示対象のユーザーとログインユーザーの取得
  const [targetUser, currentUser] = await Promise.all([
    getUserById(targetUserId),
    getUserById(currentUserId),
  ]);

  if (!targetUser) {
    redirect('/choose-friends');
  }

  // フレンド状態の初期値を取得
  const initialIsFriend = Boolean(currentUser?.friends?.[targetUserId]);

  return (
    <ProfilePage
      user={targetUser}
      isOwnProfile={false}
      currentUserId={currentUserId}
      initialIsFriend={initialIsFriend}
    />
  );
}
