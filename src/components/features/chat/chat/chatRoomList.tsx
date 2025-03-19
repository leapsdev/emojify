import type { ChatRoom } from '@/types/database';
import { formatRelativeTime } from '@/utils/date';
import Image from 'next/image';
import Link from 'next/link';

export const ChatRoomList = ({ rooms }: { rooms: ChatRoom[] }) => {
  return (
    <div className="flex-1 overflow-auto">
      <div className="divide-y">
        {rooms.map((room) => (
          <Link key={room.id} href={`/chat/${room.id}`} className="block">
            <div className="px-4 py-3 flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <Image
                  src="/placeholder.svg"
                  alt="Room avatar"
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold truncate">
                    {Object.values(room.members)
                      .map((member) => member.username)
                      .join(', ')}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {room.lastMessage
                      ? formatRelativeTime(room.lastMessage.createdAt)
                      : formatRelativeTime(room.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
