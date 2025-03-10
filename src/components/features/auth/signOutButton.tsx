'use client';

import { Button } from '@/components/ui/button';
import { usePrivy } from '@privy-io/react-auth';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const SignOutButton = () => {
  const { logout, ready, authenticated } = usePrivy();
  const router = useRouter();

  if (!ready || !authenticated) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <Button
      onClick={handleLogout}
      className="bg-black text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-gray-900 transition-colors"
    >
      <LogOut className="h-5 w-5" />
    </Button>
  );
};
