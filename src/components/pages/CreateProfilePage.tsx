import { AuthRedirect } from '@/components/features/auth/AuthRedirect';
import { ProfileForm } from '@/components/features/create-profile/ProfileForm';
import { ProfileImage } from '@/components/features/create-profile/ProfileImage';
import EthereumProviders from '@/lib/basename/EthereumProviders';

export function CreateProfilePage() {
  return (
    <EthereumProviders>
      <main className="max-w-2xl mx-auto w-full px-4 py-8">
        <AuthRedirect mode="profile" />
        <ProfileImage />
        <ProfileForm />
      </main>
    </EthereumProviders>
  );
}
