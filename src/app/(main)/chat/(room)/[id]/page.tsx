'use client';

import { ChatRoomPage } from '@/components/pages/ChatRoomPage';
import { Header } from '@/components/shared/layout/Header';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { getChatRoomAction } from '@/repository/db/chat/actions';
import type { ChatRoom, Message } from '@/repository/db/database';
import { notFound } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Page() {
  const { isAuthenticated, isLoading, userId } = useUnifiedAuth();
  const [roomData, setRoomData] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const params = useParams();
  const roomId = params.id as string;

  useEffect(() => {
    const fetchRoomData = async () => {
      if (isAuthenticated && userId && roomId) {
        try {
          const { room, messages: roomMessages } =
            await getChatRoomAction(roomId);
          if (!room) {
            notFound();
          }
          setRoomData(room);
          setMessages(roomMessages);
        } catch (error) {
          console.error('Failed to fetch room data:', error);
        }
      }
      setIsDataLoading(false);
    };

    fetchRoomData();
  }, [isAuthenticated, userId, roomId]);

  if (isLoading || isDataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !userId || !roomData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>Authentication is required</p>
        </div>
      </div>
    );
  }

  // 相手のユーザー情報を取得
  const otherMembers = Object.entries(roomData.members)
    .filter(([id]) => id !== userId)
    .map(([, member]) => member);

  if (otherMembers.length === 0) {
    notFound();
  }

  // ヘッダーに表示するユーザー名を生成
  const headerTitle = otherMembers.map((member) => member.username).join(', ');

  return (
    <>
      <Header
        backHref="/chat"
        centerContent={
          <div className="max-w-[320px] w-full text-center">
            <h1 className="font-semibold truncate">{headerTitle}</h1>
          </div>
        }
      />
      <ChatRoomPage
        roomId={roomId}
        userId={userId}
        initialMessages={messages}
      />
    </>
  );
}
