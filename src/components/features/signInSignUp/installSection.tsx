'use client';

import { LoginButton } from '@/components/features/auth/loginSignUpButton';
import { InstallButton } from '@/components/features/signInSignUp/installButton';
import { InstallModal } from '@/components/features/signInSignUp/installModal';
import { useInstallPrompt } from '@/components/pages/hooks/useInstallPrompt';

export const InstallSection = () => {
  const { showInstallModal, setShowInstallModal, handleInstall } =
    useInstallPrompt();

  return (
    <div className="flex flex-col items-center gap-4">
      <InstallButton onClick={handleInstall} />
      <LoginButton />
      <InstallModal
        open={showInstallModal}
        onOpenChange={setShowInstallModal}
      />
    </div>
  );
};
