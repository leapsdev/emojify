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
    friends,
    others,
    handleUserSelect,
  } = useUserSelection();

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
        />
      </div>

      <ChatButton visible={selectedUsers.length > 0} />
    </main>
  );
}
