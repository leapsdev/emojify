'use client';

import { SignInSignUpButton } from '@/components/features/auth/SignInSignUpButton';
import { InstallButton } from '@/components/features/signInSignUp/InstallButton';
import { InstallModal } from '@/components/features/signInSignUp/InstallModal';
import { useInstallPrompt } from '@/components/features/signInSignUp/hooks/useInstallPrompt';
import { useIsPWA } from '@/lib/hooks/useIsPWA';

export const InstallSection = () => {
  const { showInstallModal, setShowInstallModal, handleInstall } =
    useInstallPrompt();
  const isPWA = useIsPWA();
  return (
    <div className="flex flex-col items-center gap-4">
      {!isPWA && <InstallButton onClick={handleInstall} />}
      <SignInSignUpButton />
      <InstallModal
        open={showInstallModal}
        onOpenChange={setShowInstallModal}
      />
    </div>
  );
};
