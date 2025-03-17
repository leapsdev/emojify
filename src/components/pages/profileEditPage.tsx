'use client';

import { ProfileEditHeader } from '@/components/features/profile/edit/header';
import { ProfileEditForm } from '@/components/features/profile/edit/profileEditForm';
import type { User } from '@/types/database';

interface ProfileEditPageProps {
  initialUser: User;
}

export function ProfileEditPage({ initialUser }: ProfileEditPageProps) {
  return (
    <div className="min-h-screen bg-white">
      <ProfileEditHeader />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <ProfileEditForm user={initialUser} />
      </div>
    </div>
  );
}
