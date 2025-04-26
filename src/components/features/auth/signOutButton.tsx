'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';

export const SignOutButton = () => {
  const { logout, ready, authenticated } = usePrivy();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <button
      className="w-full text-center px-2 py-1.5 hover:bg-gray-200"
      type="button"
      onClick={handleLogout}
      disabled={!ready || !authenticated}
    >
      SignOut
    </button>
  );
};
