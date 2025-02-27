'use client';

import { Button } from '@/components/ui/button';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

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
      className="bg-black text-white rounded-full px-8 py-6 text-lg font-bold hover:bg-gray-900 transition-colors"
    >
      <LogOut className="mr-2 h-5 w-5" />
      Sign Out
    </Button>
  );
};
