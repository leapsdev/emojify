import Image from 'next/image';

import { DisplayUser } from '@/types/display';

interface UserItemProps {
  user: DisplayUser;
  selected: boolean;
  onSelect: () => void;
  onAddFriend?: () => void;
}

export function UserItem({ user, selected, onSelect, onAddFriend }: UserItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Image
          src={user.avatar || '/placeholder.svg'}
          alt=""
          width={48}
          height={48}
          className="w-12 h-12 rounded-full"
        />
        <div className="flex flex-col">
          <span className="font-semibold text-base">{user.displayName}</span>
          <span className="text-sm text-gray-500">{user.userId}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {user.section === 'other' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddFriend?.();
            }}
            className="px-2 py-1 text-sm text-blue-500 border border-blue-500 rounded hover:bg-blue-50"
          >
            友達追加
          </button>
        )}
        <button
          type="button"
          role="checkbox"
          aria-checked={selected}
          tabIndex={0}
          onClick={onSelect}
          onKeyDown={(e) => e.key === 'Enter' && onSelect()}
          className={`w-6 h-6 rounded-full border-2 ${
            selected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
          }`}
        />
      </div>
    </div>
  );
}
