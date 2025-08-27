'use client';

import { useFarcasterMiniApp } from '@/hooks/useFarcasterMiniApp';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';

export const SignOutButton = () => {
  const { logout, ready, authenticated } = usePrivy();
  const { removeStoredToken } = useFarcasterMiniApp();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Farcaster環境で保存されたトークンを削除
      removeStoredToken();

      // Privyからログアウト
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // エラーが発生してもホームページにリダイレクト
      router.push('/');
    }
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
