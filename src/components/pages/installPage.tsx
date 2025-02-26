import { SignOutButton } from '@/components/features/auth/signOutButton';
import { InstallContent } from '@/components/features/install/installContent';
import { InstallSection } from '@/components/features/install/installSection';

export const InstallPage = () => {
  return (
    <main className="min-h-screen bg-white p-4 relative overflow-hidden">
      <div className="absolute top-4 right-4 z-20">
        <SignOutButton />
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center">
        <InstallContent />
        <InstallSection />
      </div>
    </main>
  );
};
