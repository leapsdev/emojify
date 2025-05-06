'use client';

import { SignOutButton } from '@/components/features/auth/SignOutButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { LinkButton } from '@/components/ui/LinkButton';
import { MoreVertical } from 'lucide-react';

export const ProfileMenu = () => {
  return (
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
        <DropdownMenuItem asChild className="rounded-lg">
          <LinkButton
            href="/privacy-policy"
            content="Privacy Policy"
            className="w-full text-center px-2 py-1.5r justify-center text-base hover:bg-gray-200"
          />
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="rounded-lg">
          <LinkButton
            href="/terms"
            content="Term"
            className="w-full text-center px-2 py-1.5r justify-center text-base hover:bg-gray-200"
          />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
