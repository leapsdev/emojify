'use client';

import { Button } from '@/components/ui/Button';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useLogin, usePrivy } from '@privy-io/react-auth';
import { LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { checkUserExists } from './action';

export const SignInSignUpButton = () => {
  const { ready } = usePrivy();
  const { isAuthenticated, walletAddress, isLoading } = useUnifiedAuth();
  const router = useRouter();
  const { login } = useLogin({
    onComplete: (params) =>
      params.isNewUser ? router.push('/profile/create') : router.push('/chat'),
  });

  const handleClick = useCallback(async () => {
    if (isAuthenticated && walletAddress) {
      // 統合認証済みの場合、DBでユーザーの存在をチェック
      const exists = await checkUserExists(walletAddress);
      if (exists) {
        router.push('/chat');
      } else {
        router.push('/profile/create');
      }
    } else {
      // 未認証の場合はログイン処理を実行
      login();
    }
  }, [isAuthenticated, walletAddress, router, login]);

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
