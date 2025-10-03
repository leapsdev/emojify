'use client';

import { Button } from '@/components/ui/Button';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useLogin, usePrivy } from '@privy-io/react-auth';
import { LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export const SignInSignUpButton = () => {
  const { ready } = usePrivy();
  const { isLoading } = useUnifiedAuth();
  const router = useRouter();
  const { login } = useLogin({
    onComplete: (params) =>
      params.isNewUser ? router.push('/profile/create') : router.push('/chat'),
  });

  const handleClick = useCallback(async () => {
    // 複雑なリダイレクトロジックを削除
    // GetStartedButtonで統一して処理
    login();
  }, [login]);

  // 認証状態の初期化中は何も表示しない
  if (isLoading) {
    return null;
  }

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
