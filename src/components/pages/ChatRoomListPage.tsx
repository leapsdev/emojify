'use client';

import { ChatRoomList } from '@/components/features/chat/chat/ChatRoomList';
// import { useUserRooms } from '@/components/features/chat/chat/hooks/useUserRooms'; // 一時的にコメントアウト
import type { ChatRoom } from '@/repository/db/database';

type ChatRoomListPageProps = {
  userId: string;
  initialRooms: ChatRoom[];
};

export function ChatRoomListPage({
  userId,
  initialRooms,
}: ChatRoomListPageProps) {
  console.log('🏁 ChatRoomListPage レンダリング開始', {
    userId,
    initialRooms: initialRooms.length,
  });

  // useUserRoomsを一時的にコメントアウト
  // const rooms = useUserRooms(userId, initialRooms);
  const rooms = initialRooms; // 一時的に初期ルームをそのまま使用

  console.log('🏁 ChatRoomListPage レンダリング完了', { rooms: rooms.length });

  return (
    <main>
      <ChatRoomList rooms={rooms} currentUserId={userId} />
    </main>
  );
}
