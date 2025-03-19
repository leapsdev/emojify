import Image from 'next/image';
import Link from 'next/link';

export const ChatRoomList = ({
  rooms,
}: {
  rooms: {
    id: string;
    username: string;
    avatar: string;
    message: string;
    time: string;
    online: boolean;
  }[];
}) => {
  return (
    <div className="flex-1 overflow-auto">
      <div className="divide-y">
        {rooms.map((room) => (
          <Link key={room.id} href={`/chat/${room.id}`} className="block">
            <div className="px-4 py-3 flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <Image
                  src={room.avatar || '/placeholder.svg'}
                  alt="User avatar"
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                {room.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold truncate">{room.username}</h3>
                  <span className="text-sm text-gray-500">{room.time}</span>
                </div>
                <p className="text-gray-500 truncate">{room.message}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
