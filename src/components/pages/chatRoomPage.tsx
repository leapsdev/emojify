import { ChatRoomInput } from '@/components/features/chat/chat-room/input';
import { MessageList } from '@/components/features/chat/chat-room/message-list';
import type { Message } from '@/types/database';

type ChatRoomPageProps = {
  
  roomId: string;
  userId: string;
  initialMessages: Message[];
};

export function ChatRoomPage({
  roomId,
  userId,
  initialMessages,
}: ChatRoomPageProps) {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <MessageList
        roomId={roomId}
        currentUserId={userId}
        initialMessages={initialMessages}
      />
      <ChatRoomInput roomId={roomId} userId={userId} />
    </main>
  );
}
