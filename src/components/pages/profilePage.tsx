'use client';

import { ProfileHeader } from '@/components/features/profile/profileHeader';
import { ProfileTabs } from '@/components/features/profile/profileTabs';
import { UserProfile } from '@/components/features/profile/userProfile';

// ダミーデータ
const USER_DATA = {
  username: 'Jesse.eth',
  walletAddress: '0x7849a...9ehg',
  bio: 'Degen, work on LeapsXXXXXXXXXXXXXXXXXXXXXXXX',
  avatar: '/placeholder.svg?height=80&width=80',
};

const CREATED_EMOJIS = Array(6)
  .fill(null)
  .map((_, i) => ({
    id: String(i + 1),
    image:
      'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Group%208-FHRPq70yEc1h0CLeatZkOSPMsLbNFx.png',
    creator: {
      avatar: '/placeholder.svg?height=24&width=24',
    },
  }));

export const ProfilePage = () => {
  return (
    <main className="min-h-screen bg-white flex flex-col font-nunito">
      <ProfileHeader />
      <UserProfile {...USER_DATA} />
      <ProfileTabs createdEmojis={CREATED_EMOJIS} collectedEmojis={[]} />
    </main>
  );
};
