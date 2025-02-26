import Image from 'next/image';
import Link from 'next/link';
import type { Message } from './types';

type MessageListProps = {
  messages: Message[];
};

export const MessageList = ({ messages }: MessageListProps) => {
  return (
    <div className="flex-1 overflow-auto">
      <div className="divide-y">
        {messages.map((message) => (
          <Link key={message.id} href={`/chat/${message.id}`} className="block">
            <div className="px-4 py-3 flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <Image
                  src={message.avatar || '/placeholder.svg'}
                  alt="User avatar"
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                {message.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold truncate">{message.username}</h3>
                  <span className="text-sm text-gray-500">{message.time}</span>
                </div>
                <p className="text-gray-500 truncate">{message.message}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
