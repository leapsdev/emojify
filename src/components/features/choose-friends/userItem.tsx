import type { DisplayUser } from '@/types/display';
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
          <div className="relative">
            <input
              type="checkbox"
              checked={selected}
              onChange={onSelect}
              className="w-6 h-6 rounded-full border-2 appearance-none cursor-pointer transition-colors border-blue-300 hover:border-blue-400 checked:bg-blue-500 checked:border-blue-500"
            />
            {selected && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white pointer-events-none"
                aria-labelledby="checkbox-title"
                role="img"
              />
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddFriend?.();
            }}
            className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors border-blue-300 hover:border-blue-400"
          />
        )}
      </div>
    </div>
  );
}
