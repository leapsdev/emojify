'use client';

import { subscribeToRoomMessagesAction } from '@/components/features/chat/chat-room/action';
import { ChatRoomHeader } from '@/components/features/chat/chat-room/header';
import { ChatRoomInput } from '@/components/features/chat/chat-room/input';
import { MessageList } from '@/components/features/chat/chat-room/message-list';
import type { Message } from '@/types/database';
import { useEffect, useState } from 'react';

type ChatRoomPageProps = {
  username: string;
  roomId: string;
  userId: string;
};

export function ChatRoomPage({ username, roomId, userId }: ChatRoomPageProps) {
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = subscribeToRoomMessagesAction(roomId, setMessages);

    return () => {
      unsubscribe();
    };
  }, [roomId]);

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <ChatRoomHeader username={username} />
      <MessageList messages={messages} currentUserId={userId} />
      <ChatRoomInput roomId={roomId} userId={userId} />
    </main>
  );
}
