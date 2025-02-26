'use client';

import { ChatButton } from '@/components/features/choose-friends/chatButton';
import { Header } from '@/components/features/choose-friends/header';
import { useUserSelection } from '@/components/features/choose-friends/hooks/useUserSelection';
import { SearchBar } from '@/components/features/choose-friends/searchBar';
import { UserSection } from '@/components/features/choose-friends/userSection';

export function ChooseFriendsPage() {
  const {
    selectedUsers,
    searchQuery,
    setSearchQuery,
    recentChats,
    favorites,
    friends,
    handleUserSelect,
  } = useUserSelection();

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header />

      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      <div className="px-4 space-y-6 flex-1 overflow-auto">
        <UserSection
          title="Recent chats"
          users={recentChats}
          selectedUsers={selectedUsers}
          onUserSelect={handleUserSelect}
        />

        <UserSection
          title="Favorites"
          users={favorites}
          selectedUsers={selectedUsers}
          onUserSelect={handleUserSelect}
        />

        <UserSection
          title="Friends"
          users={friends}
          selectedUsers={selectedUsers}
          onUserSelect={handleUserSelect}
        />
      </div>

      <ChatButton visible={selectedUsers.length > 0} />
    </main>
  );
}
