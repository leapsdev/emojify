import type { User } from '@/components/features/chat/shared/types';
import { UserItem } from './userItem';

interface UserListProps {
  users: User[];
  selectedUsers: string[];
  onUserSelect: (userId: string) => void;
  onChatStart: (userId: string) => void;
}

export function UserList({
  users,
  selectedUsers,
  onUserSelect,
  onChatStart,
}: UserListProps) {
  return (
    <div className="px-4 overflow-y-auto flex-1">
      <div className="space-y-4 py-4">
        {users.map((user) => (
          <UserItem
            key={user.id}
            user={user}
            selected={selectedUsers.includes(user.id)}
            onSelect={() => onUserSelect(user.id)}
            onChatStart={() => onChatStart(user.id)}
          />
        ))}
      </div>
    </div>
  );
}
