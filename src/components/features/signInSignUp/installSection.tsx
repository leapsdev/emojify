'use client';

import { SignInSignUpButton } from '@/components/features/auth/signInSignUpButton';
import { useInstallPrompt } from '@/components/features/signInSignUp/hooks/useInstallPrompt';
import { InstallButton } from '@/components/features/signInSignUp/installButton';
import { InstallModal } from '@/components/features/signInSignUp/installModal';

export const InstallSection = () => {
  const { showInstallModal, setShowInstallModal, handleInstall } =
    useInstallPrompt();

  return (
    <div className="flex flex-col items-center gap-4">
      <InstallButton onClick={handleInstall} />
      <SignInSignUpButton />
      <InstallModal
        open={showInstallModal}
        onOpenChange={setShowInstallModal}
      />
    </div>
  );
};
