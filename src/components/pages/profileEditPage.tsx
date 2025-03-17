'use client';

import { ProfileEditHeader } from '@/components/features/profile/edit/header';
import { ProfileEditForm } from '@/components/features/profile/edit/profileEditForm';
import { ProfileImage } from '@/components/features/profile/edit/profileImage';
import type { User } from '@/types/database';

interface ProfileEditPageProps {
  initialUser: User;
}

export function ProfileEditPage({ initialUser }: ProfileEditPageProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ProfileEditHeader />
      <main className="min-h-screen bg-white flex flex-col max-w-2xl mx-auto w-full px-4 py-8">
        <ProfileImage imageUrl="/placeholder.svg" />
        <ProfileEditForm user={initialUser} />
      </main>
    </div>
  );
}
