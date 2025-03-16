'use client';

import { addFriendAction } from '@/components/features/choose-friends/actions';
import { ChatButton } from '@/components/features/choose-friends/chatButton';
import { Header } from '@/components/features/choose-friends/header';
import { useUserSelection } from '@/components/features/choose-friends/hooks/useUserSelection';
import { SearchBar } from '@/components/features/choose-friends/searchBar';
import { UserSection } from '@/components/features/choose-friends/userSection';
import { usePrivyId } from '@/hooks/usePrivyId';
import type { User } from '@/types/database';
import { toast } from 'sonner';

interface ClientChooseFriendsPageProps {
  initialFriends?: User[];
  initialOthers?: User[];
}

export function ClientChooseFriendsPage({
  initialFriends = [],
  initialOthers = [],
}: ClientChooseFriendsPageProps) {
  const userId = usePrivyId();

  const {
    selectedUsers,
    searchQuery,
    setSearchQuery,
    friends,
    others,
    handleUserSelect,
  } = useUserSelection({ initialFriends, initialOthers });

  const handleAddFriend = async (friendId: string) => {
    if (!userId) {
      toast.error('ユーザーIDが取得できません');
      return;
    }

    try {
      const result = await addFriendAction(userId, friendId);
      if (result.success) {
        toast.success('友達に追加しました');
      } else {
        toast.error(result.error || '友達の追加に失敗しました');
      }
    } catch (error) {
      toast.error('エラーが発生しました');
      console.error(error);
    }
  };

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header />
      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      <div className="px-4 space-y-6 flex-1 overflow-auto">
        <UserSection
          title="Friends"
          users={friends}
          selectedUsers={selectedUsers}
          onUserSelect={handleUserSelect}
        />

        <UserSection
          title="Others"
          users={others}
          selectedUsers={selectedUsers}
          onUserSelect={handleUserSelect}
          onAddFriend={handleAddFriend}
        />
      </div>

      <ChatButton visible={selectedUsers.length > 0} />
    </main>
  );
}
