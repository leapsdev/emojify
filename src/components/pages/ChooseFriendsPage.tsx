'use client';

import { ChatButton } from '@/components/features/choose-friends/ChatButton';
import { SearchBar } from '@/components/features/choose-friends/SearchBar';
import { UserSection } from '@/components/features/choose-friends/UserSection';
import {
  addFriendAction,
  createChatRoomAction,
} from '@/components/features/choose-friends/actions';
import { useUserSelection } from '@/components/features/choose-friends/hooks/useUserSelection';

import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import type { User } from '@/repository/db/database';
import { useRouter } from 'next/navigation';

interface ClientChooseFriendsPageProps {
  initialFriends?: Array<User & { walletAddress: string }>;
  initialOthers?: Array<User & { walletAddress: string }>;
}

export function ClientChooseFriendsPage({
  initialFriends = [],
  initialOthers = [],
}: ClientChooseFriendsPageProps) {
  const { walletAddress } = useUnifiedAuth();
  const router = useRouter();
  const {
    selectedUsers,
    searchQuery,
    setSearchQuery,
    friends,
    others,
    handleUserSelect,
  } = useUserSelection({
    currentWalletAddress: walletAddress ?? '',
    initialFriends,
    initialOthers,
  });

  const handleAddFriend = async (friendId: string) => {
    if (!walletAddress) {
      return;
    }

    try {
      const result = await addFriendAction(walletAddress, friendId);
      if (!result.success) {
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateRoom = async () => {
    if (!walletAddress) {
      return;
    }

    const result = await createChatRoomAction([
      walletAddress,
      ...selectedUsers,
    ]);
    if (!result.success) {
      return;
    }

    router.push(`/chat/${result.roomId}`);
  };

  return (
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
  );
}
