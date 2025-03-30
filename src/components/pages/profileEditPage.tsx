'use client';

import { ProfileEditForm } from '@/components/features/profile/edit/profileEditForm';
import { ProfileImage } from '@/components/features/profile/edit/profileImage';
import type { User } from '@/types/database';

interface ProfileEditPageProps {
  initialUser: User;
}

export function ProfileEditPage({ initialUser }: ProfileEditPageProps) {
  return (
    <main className="flex flex-col max-w-2xl mx-auto w-full px-4 py-8">
      <ProfileImage />
      <ProfileEditForm user={initialUser} />
    </main>
  );
}
