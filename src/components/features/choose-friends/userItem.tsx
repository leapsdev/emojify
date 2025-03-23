import type { DisplayUser } from '@/types/display';
import { MessageCircle, UserPlus } from 'lucide-react';
import Image from 'next/image';


interface UserItemProps {
  user: DisplayUser;
  selected: boolean;
  onSelect: () => void;
  onAddFriend?: () => void;
}

export function UserItem({
  user,
  selected,
  onSelect,
  onAddFriend,
}: UserItemProps) {
  return (
    <div className="flex items-center justify-between gap-2 min-w-0">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Image
          src={user.avatar || '/placeholder.svg'}
          alt=""
          width={48}
          height={48}
          className="w-12 h-12 rounded-full flex-shrink-0"
        />
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-base truncate">
            {user.displayName}
          </span>
          <span className="text-sm text-gray-500 truncate">{user.userId}</span>
        </div>
      </div>
      <div className="flex items-center flex-shrink-0">
        {user.section === 'friend' ? (
          <button
            type="button"
            onClick={onSelect}
            className={`w-10 h-10 rounded-full ${
              selected ? 'bg-blue-500' : 'bg-gray-200'
            } flex items-center justify-center`}
            aria-label="Chat with this user"
          >
            <MessageCircle className="w-5 h-5 text-white" />
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddFriend?.();
            }}
            className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center hover:bg-blue-600 transition-colors"
            aria-label="Add friend"
          >
            <UserPlus className="w-5 h-5 text-white" />
          </button>
        )}
      </div>
    </div>
  );
}
