import { ChatRoomInput } from '@/components/features/chat/chat-room/ChatInput';
import { MessageList } from '@/components/features/chat/chat-room/MessageList';
import type { Message } from '@/repository/db/database';

type ChatRoomPageProps = {
  roomId: string;
  walletAddress: string;
  initialMessages: Message[];
};

export function ChatRoomPage({
  roomId,
  walletAddress,
  initialMessages,
}: ChatRoomPageProps) {
  return (
    <main className="flex flex-col relative">
      <div className="overflow-y-auto pb-24">
        <MessageList
          roomId={roomId}
          currentWalletAddress={walletAddress}
          initialMessages={initialMessages}
        />
      </div>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <ChatRoomInput roomId={roomId} walletAddress={walletAddress} />
      </div>
    </main>
  );
}
