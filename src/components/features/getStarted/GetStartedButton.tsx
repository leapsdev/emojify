'use client';

import { useIsMiniApp } from '@/components/providers/AuthProvider';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { checkUserExists } from '../auth/action';
import { autoCreateUserFromFarcaster } from '../auth/autoCreateUser';

export const GetStartedButton = () => {
  const { isMiniApp } = useIsMiniApp();
  const { isAuthenticated, walletAddress, isLoading, ready } = useUnifiedAuth();
  const router = useRouter();

  const handleClick = useCallback(async () => {
    // ローディング中または準備未完了の場合は処理しない
    if (isLoading || !ready) {
      return;
    }

    // 認証状態とウォレットアドレスの詳細チェック
    if (isAuthenticated && walletAddress) {
      try {
        // DBでユーザーの存在を確実にチェック
        const exists = await checkUserExists(walletAddress);

        if (exists) {
          // ✅ 既存ユーザー: チャットページへ
          router.push('/chat');
        } else {
          // ✅ 新規ユーザー: Mini App環境では自動登録

          if (isMiniApp) {
            // Mini App環境: Farcaster情報で自動ユーザー登録

            try {
              await autoCreateUserFromFarcaster(walletAddress);

              // リダイレクト前に少し待機（UI更新のため）
              setTimeout(() => {
                console.log('🚀 Executing router.push("/chat")');
                router.push('/chat');
              }, 100);
            } catch (error) {
              console.error('Failed to auto-create user:', error);
              // 自動登録失敗時はプロフィール作成ページへ
              router.push('/profile/create');
            }
          } else {
            // Web環境: プロフィール作成ページへ
            router.push('/profile/create');
          }
        }
      } catch (error) {
        // DBエラーの場合はプロフィール作成ページへ（安全側に倒す）
        console.error('Error checking user existence:', error);
        router.push('/profile/create');
      }
    } else {
      // ❌ 未認証の場合
      if (!isMiniApp) {
        // Webアプリ環境の場合はサインアップページへ
        router.push('/signup');
      } else {
        // Mini App環境の場合は認証ページへ
        router.push('/');
      }
    }
  }, [isAuthenticated, walletAddress, isLoading, ready, isMiniApp, router]);

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
