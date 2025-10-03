'use client';

import { ChatRoomList } from '@/components/features/chat/chat/ChatRoomList';
import { useUserRooms } from '@/components/features/chat/chat/hooks/useUserRooms';
import type { ChatRoom } from '@/repository/db/database';

type ChatRoomListPageProps = {
  walletAddress: string;
  initialRooms: ChatRoom[];
};

export function ChatRoomListPage({
  walletAddress,
  initialRooms,
}: ChatRoomListPageProps) {
  const rooms = useUserRooms(walletAddress, initialRooms);
  return (
    <main>
      <ChatRoomList rooms={rooms} currentWalletAddress={walletAddress} />
    </main>
  );
}
