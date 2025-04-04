import { ProfileMenu } from '@/components/features/choose-friends/profileMenu';
import { ProfileTabs } from '@/components/features/profile/profileTabs';
import { UserProfile } from '@/components/features/profile/userProfile';
import { Header } from '@/components/shared/layout/header';
import type { User } from '@/types/database';

interface ProfilePageProps {
  user: User;
  isOwnProfile?: boolean;
  currentUserId?: string;
}

export const ProfilePage = ({
  user,
  isOwnProfile = true,
  currentUserId,
}: ProfilePageProps) => {
  const backHref = isOwnProfile ? '/chat' : '/choose-friends';
  const rightContent = isOwnProfile ? <ProfileMenu /> : null;
  return (
    <>
      <Header backHref={backHref} rightContent={rightContent} />
      <main className="flex flex-col font-nunito overflow-hidden max-w-full">
        <div className="overflow-y-auto overflow-x-hidden flex-1">
          <div className="max-w-full">
            <UserProfile
              username={user.username}
              bio={user.bio || ''}
              avatar="/icons/icon-192x192.png"
              userId={user.id}
              isOwnProfile={isOwnProfile}
              currentUserId={currentUserId}
            />
            <ProfileTabs
              createdEmojis={Array(6)
                .fill(null)
                .map((_, i) => ({
                  id: String(i + 1),
                  image:
                    'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Group%208-FHRPq70yEc1h0CLeatZkOSPMsLbNFx.png',
                  creator: {
                    avatar: '/icons/icon-192x192.png',
                  },
                }))}
              collectedEmojis={[]}
            />
          </div>
        </div>
      </main>
    </>
  );
};
