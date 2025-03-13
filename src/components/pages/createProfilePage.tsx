import { ProfileForm } from '@/components/features/create-profile/profileForm';
import { ProfileImage } from '@/components/features/create-profile/profileImage';
import { RedirectIfUserExists } from '@/components/features/create-profile/redirectIfUserExists';

export function CreateProfilePage() {
  return (
    <main className="min-h-screen bg-white flex flex-col max-w-2xl mx-auto w-full px-4 py-8">
      <RedirectIfUserExists />
      <ProfileImage />
      <ProfileForm />
    </main>
  );
}
