import { ProfilePage } from '@/components/pages/profilePage';
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

  // フレンドかどうかのチェック
  const isFriend = Boolean(currentUser?.friends?.[targetUserId]);
  console.log(isFriend);

  return <ProfilePage user={targetUser} isOwnProfile={false} />;
}
