import { SignOutButton } from '@/components/features/auth/signOutButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';
import Link from 'next/link';

export const ProfileHeader = () => {
  return (
    <div className="flex items-center justify-between p-4 border-b">
      <Link href="/chat" className="text-2xl">
        👈
      </Link>
      <div className="w-6" /> {/* スペーサー */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <MoreVertical className="w-6 h-6" />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="rounded-xl min-w-[120px] bg-white dark:bg-gray-800"
        >
          <DropdownMenuItem asChild className="rounded-lg">
            <SignOutButton />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
