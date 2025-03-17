'use client';

import { ProfileHeader } from '@/components/features/profile/profileHeader';
import { ProfileTabs } from '@/components/features/profile/profileTabs';
import { UserProfile } from '@/components/features/profile/userProfile';
import type { User } from '@/types/database';

interface ProfilePageProps {
  user: User;
}

export const ProfilePage = ({ user }: ProfilePageProps) => {
  return (
    <main className="min-h-screen bg-white flex flex-col font-nunito">
      <ProfileHeader />
      <UserProfile
        username={user.username}
        bio={user.bio || ''}
        walletAddress={user.id}
        avatar="/placeholder.svg?height=80&width=80"
        userId={user.id}
      />
      <ProfileTabs createdEmojis={[]} collectedEmojis={[]} />
    </main>
  );
};
