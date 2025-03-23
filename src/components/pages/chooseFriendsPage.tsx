'use client';

import {
  addFriendAction,
  createChatRoomAction,
} from '@/components/features/choose-friends/actions';
import { ChatButton } from '@/components/features/choose-friends/chatButton';
import { Header } from '@/components/features/choose-friends/header';
import { useUserSelection } from '@/components/features/choose-friends/hooks/useUserSelection';
import { SearchBar } from '@/components/features/choose-friends/searchBar';
import { UserSection } from '@/components/features/choose-friends/userSection';
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
      toast.error('ユーザーIDが取得できません');
      return;
    }

    try {
      const result = await addFriendAction(userId, friendId);
      if (result.success) {
        toast.success('友達に追加しました');
      } else {
        router.refresh();
      }
    } catch (error) {
      toast.error('エラーが発生しました');
      console.error(error);
    }
  };

  const handleCreateChatRoom = async () => {
    try {
      if (!userId) {
        toast.error('ユーザーIDが取得できません');
        return;
      }
      // 現在のユーザーも含めてチャットルームを作成
      const result = await createChatRoomAction([userId, ...selectedUsers]);
      if (result.success && result.roomId) {
        toast.success('チャットルームを作成しました');
        // トーストが表示される時間を確保するため、少し遅延させる
        setTimeout(() => {
          router.push(`/chat/${result.roomId}`);
        }, 1000);
      } else {
        toast.error(result.error || 'チャットルームの作成に失敗しました');
      }
    } catch (error) {
      toast.error('チャットルームの作成に失敗しました');
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

      <ChatButton
        visible={selectedUsers.length > 0}
        onClick={handleCreateChatRoom}
      />
    </main>
  );
}
