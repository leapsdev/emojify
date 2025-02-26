'use client';

import { Button } from '@/components/ui/button';
import { usePrivy } from '@privy-io/react-auth';
import { LogIn } from 'lucide-react';

export const LoginButton = () => {
  const { login, ready, authenticated } = usePrivy();

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
