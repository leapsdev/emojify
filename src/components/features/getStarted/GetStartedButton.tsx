'use client';

import { useIsMiniApp } from '@/components/providers/AuthProvider';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { checkUserExists } from '../auth/action';

export const GetStartedButton = () => {
  const { isMiniApp } = useIsMiniApp();
  const { isAuthenticated, walletAddress, isLoading } = useUnifiedAuth();
  const router = useRouter();

  const handleClick = useCallback(async () => {
    // ローディング中は処理しない
    if (isLoading) {
      return;
    }

    if (isAuthenticated && walletAddress) {
      // 認証済みの場合、DBでユーザーの存在をチェック
      const exists = await checkUserExists(walletAddress);
      if (exists) {
        // ユーザーが存在する場合はチャットページへ
        router.push('/chat');
      } else {
        // ユーザーが存在しない場合はプロフィール作成ページへ
        router.push('/profile/create');
      }
    } else {
      // 未認証の場合
      if (!isMiniApp) {
        // Webアプリ環境の場合はサインアップページへ
        router.push('/signup');
      } else {
        // Mini App環境の場合は認証ページへ
        router.push('/');
      }
    }
  }, [isAuthenticated, walletAddress, isLoading, isMiniApp, router]);

  return (
    <div className="mt-auto">
      <button
        type="button"
        onClick={handleClick}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-full py-2.5 text-xl font-black flex justify-center items-center"
      >
        Get started
      </button>
    </div>
  );
};
