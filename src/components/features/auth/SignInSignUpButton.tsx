'use client';

import { Button } from '@/components/ui/Button';
import { usePrivy } from '@privy-io/react-auth';
import { LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const SignInSignUpButton = () => {
  const { ready, authenticated, login } = usePrivy();
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await login();
      // Note: You might need to implement a way to check if the user is new
      // For now, we'll redirect to /chat as a default
      router.push('/chat');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  useEffect(() => {
    if (authenticated) {
      router.push('/chat');
    }
  }, [authenticated, router]);

  return (
    <Button
      disabled={!ready}
      onClick={handleLogin}
      className="bg-black text-white rounded-full px-8 py-6 text-lg font-bold hover:bg-gray-900 transition-colors"
    >
      <LogIn className="mr-2 h-5 w-5" />
      Login / Signup
    </Button>
  );
};
