import type { User } from '@/repository/db/database';
import { UserItem } from './UserItem';

interface DisplayUser extends Pick<User, 'id' | 'username'> {
  displayName: string;
  userId: string;
  avatar: string;
  section: 'friend' | 'other';
}

interface UserSectionProps {
  title: string;
  users: DisplayUser[];
  selectedUsers: string[];
  onUserSelect: (userId: string) => void;
  onAddFriend?: (userId: string) => void;
  count?: number;
}

export function UserSection({
  title,
  users,
  selectedUsers,
  onUserSelect,
  onAddFriend,
  count,
}: UserSectionProps) {
  if (users.length === 0) return null;

  return (
    <section>
      <h2 className="text-gray-500 text-sm mb-4">
        {title} {count !== undefined ? count : users.length}
      </h2>
      <div className="space-y-4">
        {users.map((user) => (
          <UserItem
            key={user.id}
            user={user}
            selected={selectedUsers.includes(user.id)}
            onSelect={() => onUserSelect(user.id)}
            onAddFriend={() => onAddFriend?.(user.id)}
          />
        ))}
      </div>
    </section>
  );
}
