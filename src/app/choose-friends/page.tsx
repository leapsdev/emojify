"use client"

import { Header } from "@/components/features/choose-friends/Header"
import { SearchBar } from "@/components/features/choose-friends/SearchBar"
import { UserSection } from "@/components/features/choose-friends/UserSection"
import { ChatButton } from "@/components/features/choose-friends/ChatButton"
import { useUserSelection } from "@/components/features/choose-friends/hooks/useUserSelection"

export default function ChooseFriends() {
  const {
    selectedUsers,
    searchQuery,
    setSearchQuery,
    recentChats,
    favorites,
    friends,
    handleUserSelect,
  } = useUserSelection()

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <SearchBar 
        value={searchQuery}
        onChange={setSearchQuery}
      />

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
  )
}
