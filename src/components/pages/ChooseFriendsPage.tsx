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
import { useToastRedirect } from '@/lib/hooks/useToastRedirect';
import { usePrivyId } from '@/lib/usePrivy';
import type { User } from '@/types/database';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const toastRedirect = useToastRedirect();
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
      toast.error('Failed to get user ID');
      return;
    }

    try {
      const result = await addFriendAction(userId, friendId);
      if (result.success) {
        toast.success('Friend added');
      } else {
        router.refresh();
      }
    } catch (error) {
      toast.error('An error occurred');
      console.error(error);
    }
  };

  const handleCreateChatRoom = async () => {
    try {
      if (!userId) {
        toast.error('Failed to get user ID');
        return;
      }
      // 現在のユーザーも含めてチャットルームを作成
      const result = await createChatRoomAction([userId, ...selectedUsers]);
      if (result.success && result.roomId) {
        toastRedirect('Chat room created', `/chat/${result.roomId}`);
      } else {
        toast.error(result.error || 'Failed to create chat room');
      }
    } catch (error) {
      toast.error('Failed to create chat room');
      console.error(error);
    }
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
          onClick={handleCreateChatRoom}
        />
      </main>
    </EthereumProviders>
  );
}
