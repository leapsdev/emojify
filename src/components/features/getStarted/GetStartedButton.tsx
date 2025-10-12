'use client';

import { useIsMiniApp } from '@/components/providers/AuthProvider';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { autoCreateUserFromFarcaster } from '@/repository/db/user/actions';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { checkUserExists } from '../auth/action';

export const GetStartedButton = () => {
  const { isMiniApp } = useIsMiniApp();
  const {
    isAuthenticated,
    walletAddress,
    isLoading,
    ready,
    user,
    farcasterUsername,
    farcasterPfpUrl,
  } = useUnifiedAuth();
  const router = useRouter();

  const handleClick = useCallback(async () => {
    // ローディング中または準備未完了の場合は処理しない
    if (isLoading || !ready) {
      return;
    }

    // 認証済みの場合、Firebaseユーザーが存在するまで待つ
    if (isAuthenticated && !user) {
      return;
    }

    // 認証状態とウォレットアドレスとFirebaseユーザーの詳細チェック
    if (walletAddress) {
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
              // Farcasterプロフィールデータで自動登録
              // username は実質的に必須（すべてのFarcasterユーザーが持つ）
              await autoCreateUserFromFarcaster(
                {
                  username: farcasterUsername || 'no-username',
                  bio: null,
                  imageUrl: farcasterPfpUrl || null,
                },
                walletAddress,
              );

              // リダイレクト前に少し待機（UI更新のため）
              setTimeout(() => {
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
      // ❌ ウォレットアドレスがない場合
      if (!isMiniApp) {
        // Webアプリ環境の場合はサインアップページへ
        router.push('/signup');
      }
    }
  }, [
    isAuthenticated,
    walletAddress,
    user,
    isLoading,
    ready,
    isMiniApp,
    router,
    farcasterUsername,
    farcasterPfpUrl,
  ]);

  // ボタンを無効化する条件
  // 認証処理中（isLoadingがtrue）または準備未完了（readyがfalse）の場合のみ無効化
  // 認証済みの場合は、userが存在するまで待つ
  const isButtonDisabled = isLoading || !ready || (isAuthenticated && !user);

  return (
    <div className="mt-auto">
      <button
        type="button"
        onClick={handleClick}
        disabled={isButtonDisabled}
        className={`w-full rounded-full py-2.5 text-xl font-black flex justify-center items-center transition-colors ${
          isButtonDisabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {isLoading ? 'Loading...' : 'Get started'}
      </button>
    </div>
  );
};
