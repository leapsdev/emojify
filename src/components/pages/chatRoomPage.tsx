'use client';

import { ChatRoomHeader } from '@/components/features/chat/chat-room/header';
import { ChatRoomInput } from '@/components/features/chat/chat-room/input';
import { ChatRoomMessages } from '@/components/features/chat/chat-room/messages';
import { DUMMY_CHAT_MESSAGES } from '@/components/features/chat/shared/constants';
import { useState } from 'react';

type ChatRoomPageProps = {
  username: string;
};

export const ChatRoomPage = ({ username }: ChatRoomPageProps) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    // メッセージ送信のロジックをここに実装
    setMessage('');
  };

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <ChatRoomHeader username={username} />
      <ChatRoomMessages messages={DUMMY_CHAT_MESSAGES} />
      <ChatRoomInput
        message={message}
        onMessageChange={setMessage}
        onSubmit={handleSubmit}
      />
    </main>
  );
};
