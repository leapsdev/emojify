'use client';

import { ChatRoomList } from '@/components/features/chat/chat/chatRoomList';
import { useUserRooms } from '@/components/features/chat/chat/hooks/useUserRooms';
import type { ChatRoom } from '@/types/database';

type ChatRoomListPageProps = {
  userId: string;
  initialRooms: ChatRoom[];
};

export function ChatRoomListPage({
  userId,
  initialRooms,
}: ChatRoomListPageProps) {
  const rooms = useUserRooms(userId, initialRooms);

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <ChatRoomList rooms={rooms} currentUserId={userId} />
    </main>
  );
}
