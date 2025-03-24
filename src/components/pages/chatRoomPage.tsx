import { ChatRoomHeader } from '@/components/features/chat/chat-room/header';
import { ChatRoomInput } from '@/components/features/chat/chat-room/input';
import { MessageList } from '@/components/features/chat/chat-room/message-list';
import type { Message } from '@/types/database';

type ChatRoomPageProps = {
  username: string;
  roomId: string;
  userId: string;
  initialMessages: Message[];
};

export function ChatRoomPage({
  username,
  roomId,
  userId,
  initialMessages,
}: ChatRoomPageProps) {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <ChatRoomHeader username={username} />
      <MessageList
        roomId={roomId}
        currentUserId={userId}
        initialMessages={initialMessages}
      />
      <ChatRoomInput roomId={roomId} userId={userId} />
    </main>
  );
}
