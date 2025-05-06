import { ClientChooseFriendsPage } from '@/components/pages/ChooseFriendsPage';
import { getPrivyId } from '@/lib/auth';
import { getUsersWithFriendship } from '@/repository/user/actions';

export const dynamic = 'force-dynamic';

export default async function ChooseFriendsPage() {
  const userId = await getPrivyId();
  if (!userId) {
    return null;
  }

  const { friends, others } = await getUsersWithFriendship(userId);
  return (
    <ClientChooseFriendsPage initialFriends={friends} initialOthers={others} />
  );
}
