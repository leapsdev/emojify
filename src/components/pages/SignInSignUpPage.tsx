import { InstallContent } from '@/components/features/signInSignUp/InstallContent';
import { InstallSection } from '@/components/features/signInSignUp/InstallSection';

export const SignInSignUpPage = () => {
  return (
    <main className="min-h-screen bg-white p-4 relative overflow-hidden">
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center">
        <InstallContent />
        <InstallSection />
      </div>
    </main>
  );
};
