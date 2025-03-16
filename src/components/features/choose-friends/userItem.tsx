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
        {user.section === 'friend' ? (
          <button
            type="button"
            role="checkbox"
            aria-checked={selected}
            tabIndex={0}
            onClick={onSelect}
            onKeyDown={(e) => e.key === 'Enter' && onSelect()}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
              selected 
                ? 'bg-blue-500 border-blue-500 text-white' 
                : 'border-blue-300 hover:border-blue-400'
            }`}
          >
            {selected && (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddFriend?.();
            }}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors border-blue-300 hover:border-blue-400`}
          >
          </button>
        )}
      </div>
    </div>
  );
}
