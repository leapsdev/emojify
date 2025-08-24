'use client';

import { useFarcasterMiniApp } from '@/hooks/useFarcasterMiniApp';
import { usePrivy } from '@privy-io/react-auth';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { checkUserExists } from './action';

type Props = {
  mode: 'auth' | 'profile';
};

export const AuthRedirect = ({ mode }: Props) => {
  const { authenticated, user } = usePrivy();
  const router = useRouter();
  const pathname = usePathname();
  const { isReady, context } = useFarcasterMiniApp();

  // Farcaster環境でのナビゲーション処理
  const navigateWithFarcaster = useCallback(
    (path: string) => {
      if (context) {
        console.log('Farcaster context detected, using mini app navigation');
        // Farcaster環境ではより長い遅延を入れてからナビゲーション
        setTimeout(() => {
          try {
            console.log(`Navigating to: ${path}`);
            router.push(path);
          } catch (error) {
            console.error('Navigation error:', error);
            // エラーが発生した場合は強制的にリロード
            window.location.href = path;
          }
        }, 300);
      } else {
        console.log(`Regular navigation to: ${path}`);
        router.push(path);
      }
    },
    [context, router],
  );

  useEffect(() => {
    const handleAuthRedirect = async () => {
      console.log('AuthRedirect: Starting redirect logic', {
        mode,
        authenticated,
        hasUser: !!user,
        pathname,
        isReady,
        hasContext: !!context,
      });

      // Farcaster Mini App SDKが準備完了するまで待機
      if (!isReady) {
        console.log('AuthRedirect: Waiting for Farcaster Mini App SDK...');
        return;
      }

      // プロフィール作成ページの場合
      if (mode === 'profile') {
        const exists = await checkUserExists();
        if (exists) {
          navigateWithFarcaster('/chat');
        }
        return;
      }

      // 認証関連のページの場合
      if (mode === 'auth') {
        // 既にログイン済みの場合の処理
        if (authenticated && user) {
          console.log('User is already authenticated, checking profile...');

          // サインアップページやサインインページにいる場合は、プロフィール確認後に適切なページにリダイレクト
          if (pathname === '/signup' || pathname === '/signin') {
            const exists = await checkUserExists();
            if (exists) {
              console.log('Profile exists, redirecting to chat...');
              navigateWithFarcaster('/chat');
            } else {
              console.log(
                'Profile does not exist, redirecting to profile creation...',
              );
              navigateWithFarcaster('/profile/create');
            }
            return;
          }

          // その他の認証が必要なページの場合
          if (pathname === '/' || pathname === '/profile/create') return;

          const exists = await checkUserExists();
          if (!exists) {
            navigateWithFarcaster('/profile/create');
          }
        }

        // 未認証の場合
        if (!authenticated || !user) return;
      }
    };

    handleAuthRedirect();
  }, [
    authenticated,
    user,
    pathname,
    mode,
    isReady,
    context,
    navigateWithFarcaster,
  ]);

  return null;
};
