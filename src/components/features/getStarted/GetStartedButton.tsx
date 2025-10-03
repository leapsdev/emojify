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

    // 認証状態とウォレットアドレスの詳細チェック
    if (isAuthenticated && walletAddress) {
      try {
        // DBでユーザーの存在を確実にチェック
        const exists = await checkUserExists(walletAddress);

        if (exists) {
          // ✅ 既存ユーザー: チャットページへ
          console.log('Existing user found, redirecting to /chat');
          router.push('/chat');
        } else {
          // ✅ 新規ユーザー: プロフィール作成ページへ
          console.log('New user, redirecting to /profile/create');
          router.push('/profile/create');
        }
      } catch (error) {
        // DBエラーの場合はプロフィール作成ページへ（安全側に倒す）
        console.error('Error checking user existence:', error);
        router.push('/profile/create');
      }
    } else {
      // ❌ 未認証の場合
      console.log('User not authenticated, redirecting to auth page');
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
