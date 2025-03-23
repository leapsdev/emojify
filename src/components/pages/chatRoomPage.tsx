import { ChatRoomHeader } from '@/components/features/chat/chat-room/header';
import { ChatRoomInput } from '@/components/features/chat/chat-room/input';
import { MessageList } from '@/components/features/chat/chat-room/message-list';

type ChatRoomPageProps = {
  username: string;
  roomId: string;
  userId: string;
};

export function ChatRoomPage({ username, roomId, userId }: ChatRoomPageProps) {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <ChatRoomHeader username={username} />
      <MessageList roomId={roomId} currentUserId={userId} />
      <ChatRoomInput roomId={roomId} userId={userId} />
    </main>
  );
}
