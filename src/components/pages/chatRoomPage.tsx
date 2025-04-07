import { ChatRoomInput } from '@/components/features/chat/chat-room/chatInput';
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
    <main className="flex flex-col relative">
      <div className="overflow-y-auto pb-24">
        <MessageList
          roomId={roomId}
          currentUserId={userId}
          initialMessages={initialMessages}
        />
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <ChatRoomInput roomId={roomId} userId={userId} />
      </div>
    </main>
  );
}
