'use client';

import { Button } from '@/components/ui/Button';
import { useLogin, usePrivy } from '@privy-io/react-auth';
import { LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const SignInSignUpButton = () => {
  const { ready, authenticated } = usePrivy();
  const router = useRouter();
  const { login } = useLogin({
    onComplete: (params) =>
      params.isNewUser ? router.push('/profile/create') : router.push('/chat'),
  });

  const handleClick = () => {
    if (authenticated) {
      // 認証済みの場合は/chatにリダイレクト
      router.push('/chat');
    } else {
      // 未認証の場合はログイン処理を実行
      login();
    }
  };

  return (
    <Button
      disabled={!ready}
      onClick={handleClick}
      className="bg-black text-white rounded-full px-8 py-6 text-lg font-bold hover:bg-gray-900 transition-colors"
    >
      <LogIn className="mr-2 h-5 w-5" />
      Login / Signup
    </Button>
  );
};
