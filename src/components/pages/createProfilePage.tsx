import { AuthRedirect } from '@/components/features/auth/authRedirect';
import { ProfileForm } from '@/components/features/create-profile/profileForm';
import { ProfileImage } from '@/components/features/create-profile/profileImage';
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
