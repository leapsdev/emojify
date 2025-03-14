import { AuthRedirect } from '@/components/features/auth/authRedirect';
import { ProfileForm } from '@/components/features/create-profile/profileForm';
import { ProfileImage } from '@/components/features/create-profile/profileImage';

export function CreateProfilePage() {
  return (
    <main className="min-h-screen bg-white flex flex-col max-w-2xl mx-auto w-full px-4 py-8">
      <AuthRedirect mode="profile" />
      <ProfileImage />
      <ProfileForm />
    </main>
  );
}
