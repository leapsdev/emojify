'use client';

import { checkUserExists } from '@/components/features/auth/action';
import { DynamicFloatingEmojis } from '@/components/features/getStarted/FloatingEmojis';
import { GetStartedButton } from '@/components/features/getStarted/GetStartedButton';
import MainContent from '@/components/features/getStarted/MainContent';
import { useIsMiniApp } from '@/components/providers/AuthProvider';
import { Loading } from '@/components/ui/Loading';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { autoCreateUserFromFarcaster } from '@/repository/db/user/actions';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export const GetStartedPage = () => {
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
  const [isRedirecting, setIsRedirecting] = useState(false);

  // 認証済みユーザーの自動リダイレクト
  useEffect(() => {
    const handleAutoRedirect = async () => {
      // ローディング中または準備未完了の場合は待機
      if (isLoading || !ready) {
        return;
      }

      // 認証済みの場合、Firebaseユーザーが存在するまで待つ
      if (isAuthenticated && !user) {
        return;
      }

      // リダイレクト処理中は重複実行を防ぐ
      if (isRedirecting) {
        return;
      }

      // 認証済みかつウォレットアドレスがある場合、自動リダイレクト
      if (isAuthenticated && walletAddress && user) {
        setIsRedirecting(true);

        try {
          // DBでユーザーの存在を確認
          const exists = await checkUserExists(walletAddress);

          if (exists) {
            // 既存ユーザー: チャットページへ
            router.push('/chat');
          } else {
            // 新規ユーザー
            if (isMiniApp) {
              // Mini App環境: Farcaster情報で自動ユーザー登録
              try {
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
          console.error('Error checking user existence:', error);
          // エラーの場合はリダイレクトをキャンセル
          setIsRedirecting(false);
        }
      }
    };

    handleAutoRedirect();
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
    isRedirecting,
  ]);

  // ローディング中またはリダイレクト中の場合はローディング画面を表示
  if (isLoading || !ready || isRedirecting) {
    return (
      <main className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center">
        <Loading size="md" text="Loading..." />
      </main>
    );
  }

  // 未認証の場合は通常のGet Startedページを表示
  return (
    <main className="min-h-screen bg-white relative overflow-hidden">
      <DynamicFloatingEmojis />
      <div className="relative z-10 flex flex-col min-h-screen p-6">
        <MainContent />
        <GetStartedButton />
      </div>
    </main>
  );
};
