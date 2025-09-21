'use client';

import { ChatRoomListPage } from '@/components/pages/ChatRoomListPage';
// import { getUserRooms } from '@/repository/db/chat/actions'; // 一時的にコメントアウト
import type { ChatRoom } from '@/repository/db/database';
// import { usePrivy } from '@privy-io/react-auth'; // 一時的にコメントアウト
import { useEffect, useState } from 'react';

export default function Page() {
  // const { user, authenticated } = usePrivy(); // 一時的にコメントアウト
  const user = { id: 'temp_user_id' }; // 一時的に固定値
  const authenticated = true; // 一時的に固定値
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 一時的にローディングを即座に終了
    console.log('🏁 チャットページローディング完了（一時的）');
    setRooms([]); // 空のルーム配列
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!authenticated || !user?.id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>Authentication is required</p>
        </div>
      </div>
    );
  }

  return <ChatRoomListPage userId={user.id} initialRooms={rooms} />;
}
