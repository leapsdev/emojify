'use client';

import { Button } from '@/components/ui/button';
import { useLogin, usePrivy } from '@privy-io/react-auth';
import { LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const SignInSignUpButton = () => {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();

  const { login } = useLogin({
    onComplete: (params) => {
      console.log(params);
      if (params.isNewUser) {
        router.push('/create-profile');
      } else {
        // TODO: 実装が完了したらリダイレクトを切り替える
        router.push('/create-profile');
      }
    },
  });

  if (!ready || authenticated) return null;

  return (
    <Button
      onClick={login}
      className="bg-black text-white rounded-full px-8 py-6 text-lg font-bold hover:bg-gray-900 transition-colors"
    >
      <LogIn className="mr-2 h-5 w-5" />
      Login / Signup
    </Button>
  );
};
