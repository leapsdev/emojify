'use client';

import { ProfileEditForm } from '../features/profile/edit/profileEditForm';
import type { User } from '@/types/database';

interface ProfileEditPageProps {
  initialUser: User;
}

export function ProfileEditPage({ initialUser }: ProfileEditPageProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">プロフィール編集</h1>
        <ProfileEditForm user={initialUser} />
      </div>
    </div>
  );
}
