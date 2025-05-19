import { DotBadge } from '@/components/ui/DotBadge';
import { formatRelativeTime } from '@/lib/date';
import type { ChatRoom as ChatRoomType } from '@/repository/database';
import Image from 'next/image';
import Link from 'next/link';
import { useRoomMembers } from './hooks/useRoomMembers';
import { useUnreadStatus } from './hooks/useUnreadStatus';

type ChatRoomProps = {
  room: ChatRoomType;
  currentUserId: string;
};

type Member = {
  joinedAt: number;
  username: string;
  lastReadAt: number;
  imageUrl?: string | null;
};

const ChatRoom = ({ room, currentUserId }: ChatRoomProps) => {
  const hasUnread = useUnreadStatus(room.id, currentUserId);
  const members = useRoomMembers(room.id);

  // メンバー情報を取得（自分以外）
  const otherMembers = Object.entries(members).filter(
    ([memberId]) => memberId !== currentUserId,
  ) as [string, Member][];

  // アバター画像のURLを決定
  const getAvatarUrl = () => {
    if (otherMembers.length === 1) {
      // 1対1のチャットの場合、相手のアバターを使用
      return otherMembers[0][1].imageUrl || '/icons/icon-192x192.png';
    }
    // グループチャットまたはその他の場合、デフォルトアイコンを使用
    return '/icons/icon-192x192.png';
  };

  return (
    <Link href={`/chat/${room.id}`} className="block">
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <Image
            src={getAvatarUrl()}
            alt="Room avatar"
            width={48}
            height={48}
            className="rounded-full"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold truncate">
              {otherMembers.map(([, member]) => member.username).join(', ')}
            </h3>
            <div className="flex items-center gap-2">
              {hasUnread && <DotBadge />}
              <span className="text-sm text-gray-500">
                {room.lastMessage
                  ? formatRelativeTime(room.lastMessage.createdAt)
                  : formatRelativeTime(room.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export const ChatRoomList = ({
  rooms,
  currentUserId,
}: {
  rooms: ChatRoomType[];
  currentUserId: string;
}) => {
  return (
    <div className="pb-14">
      {rooms.map((room) => (
        <ChatRoom key={room.id} room={room} currentUserId={currentUserId} />
      ))}
    </div>
  );
};
