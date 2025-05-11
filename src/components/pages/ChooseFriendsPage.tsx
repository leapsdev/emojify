'use client';

import { ChatButton } from '@/components/features/choose-friends/ChatButton';
import { SearchBar } from '@/components/features/choose-friends/SearchBar';
import { UserSection } from '@/components/features/choose-friends/UserSection';
import {
  addFriendAction,
  createChatRoomAction,
} from '@/components/features/choose-friends/actions';
import { useUserSelection } from '@/components/features/choose-friends/hooks/useUserSelection';
import EthereumProviders from '@/lib/basename/EthereumProviders';
import { usePrivyId } from '@/lib/usePrivy';
import type { User } from '@/types/database';
import { useRouter } from 'next/navigation';

interface ClientChooseFriendsPageProps {
  initialFriends?: User[];
  initialOthers?: User[];
}

export function ClientChooseFriendsPage({
  initialFriends = [],
  initialOthers = [],
}: ClientChooseFriendsPageProps) {
  const userId = usePrivyId();
  const router = useRouter();
  const {
    selectedUsers,
    searchQuery,
    setSearchQuery,
    friends,
    others,
    handleUserSelect,
  } = useUserSelection({
    currentUserId: userId ?? '',
    initialFriends,
    initialOthers,
  });

  const handleAddFriend = async (friendId: string) => {
    if (!userId) {
      return;
    }

    try {
      const result = await addFriendAction(userId, friendId);
      if (!result.success) {
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateRoom = async () => {
    if (!userId) {
      return;
    }

    const result = await createChatRoomAction([userId, ...selectedUsers]);
    if (!result.success) {
      return;
    }

    router.push(`/chat/${result.roomId}`);
  };

  return (
    <EthereumProviders>
      <main className="flex flex-col">
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

        <ChatButton
          visible={selectedUsers.length > 0}
          onClick={handleCreateRoom}
        />
      </main>
    </EthereumProviders>
  );
}
