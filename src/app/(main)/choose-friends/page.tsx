import { getUsersWithFriendshipAction } from '@/components/features/choose-friends/actions';
import { ClientChooseFriendsPage } from '@/components/pages/chooseFriendsPage';
import { getPrivyId } from '@/lib/auth';

export default async function ChooseFriendsPage() {
  const userId = await getPrivyId();
  if (!userId) {
    return;
  }

  const result = await getUsersWithFriendshipAction(userId);
  const { friends = [], others = [] } = result.success
    ? result
    : { friends: [], others: [] };
  return (
    <ClientChooseFriendsPage initialFriends={friends} initialOthers={others} />
  );
}
