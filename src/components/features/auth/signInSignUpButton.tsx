'use client';

import { Button } from '@/components/ui/button';
import { useLogin, usePrivy } from '@privy-io/react-auth';
import { LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const SignInSignUpButton = () => {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();

  const { login } = useLogin({
    onComplete: (params) =>
      params.isNewUser ? router.push('/profile/create') : router.push('/chat'),
  });

  useEffect(() => {
    if (authenticated) {
      router.push('/chat');
    }
  }, [authenticated, router]);

  return (
    <Button
      disabled={!ready}
      onClick={login}
      className="bg-black text-white rounded-full px-8 py-6 text-lg font-bold hover:bg-gray-900 transition-colors"
    >
      <LogIn className="mr-2 h-5 w-5" />
      Login / Signup
    </Button>
  );
};
