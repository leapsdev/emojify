'use client';

import { Button } from '@/components/ui/Button';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useLogin, usePrivy } from '@privy-io/react-auth';
import { LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { checkUserExists } from './action';

export const SignInSignUpButton = () => {
  const { ready } = usePrivy();
  const { isAuthenticated, isLoading, walletAddress } = useUnifiedAuth();
  const router = useRouter();
  const [loginCompleted, setLoginCompleted] = useState(false);

  const { login } = useLogin({
    onComplete: () => {
      setLoginCompleted(true);
    },
  });

  // ログイン完了後にDBでユーザー存在をチェック
  useEffect(() => {
    const checkUserAfterLogin = async () => {
      if (loginCompleted && isAuthenticated && walletAddress) {
        try {
          const exists = await checkUserExists(walletAddress);

          if (exists) {
            router.push('/chat');
          } else {
            router.push('/profile/create');
          }
        } catch (error) {
          console.error('Error checking user existence after login:', error);
          // エラーの場合は安全側に倒してプロフィール作成ページへ
          router.push('/profile/create');
        }
        // チェック完了後にフラグをリセット
        setLoginCompleted(false);
      }
    };

    checkUserAfterLogin();
  }, [loginCompleted, isAuthenticated, walletAddress, router]);

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
