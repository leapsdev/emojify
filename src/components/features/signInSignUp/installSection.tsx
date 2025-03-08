'use client';

import { SignInSignUpButton } from '@/components/features/auth/signInSignUpButton';
import { InstallButton } from '@/components/features/signInSignUp/installButton';

export const InstallSection = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      <InstallButton />
      <SignInSignUpButton />
    </div>
  );
};
