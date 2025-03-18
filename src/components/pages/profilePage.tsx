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
    <main className="min-h-screen bg-white flex flex-col font-nunito overflow-hidden max-w-full">
      <ProfileHeader />
      <div className="overflow-y-auto overflow-x-hidden flex-1">
        <div className="max-w-full">
          <UserProfile
            username={user.username}
            bio={user.bio || ''}
            walletAddress={user.id}
            avatar="/placeholder.svg?height=80&width=80"
            userId={user.id}
          />
          <ProfileTabs
            createdEmojis={Array(6)
              .fill(null)
              .map((_, i) => ({
                id: String(i + 1),
                image:
                  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Group%208-FHRPq70yEc1h0CLeatZkOSPMsLbNFx.png',
                creator: {
                  avatar: '/placeholder.svg?height=24&width=24',
                },
              }))}
            collectedEmojis={[]}
          />
        </div>
      </div>
    </main>
  );
};
