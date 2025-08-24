'use client';

import { useFarcasterMiniApp } from '@/hooks/useFarcasterMiniApp';
import { usePrivy } from '@privy-io/react-auth';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { checkUserExistsClient } from './action';

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

        // Farcaster環境では複数のナビゲーション方法を試行
        let navigationAttempted = false;

        const attemptNavigation = () => {
          if (navigationAttempted) return;
          navigationAttempted = true;

          try {
            console.log(`Attempting navigation to: ${path}`);

            // まずrouter.pushを試行
            router.push(path);

            // ナビゲーションが成功したかどうかを確認するため、少し待ってから現在のパスをチェック
            setTimeout(() => {
              const currentPath = window.location.pathname;
              console.log(`Current path after navigation: ${currentPath}`);

              // パスが変わっていない場合は、router.replaceを試行
              if (currentPath !== path) {
                console.log('Navigation failed, trying router.replace...');
                try {
                  router.replace(path);

                  // 再度チェック
                  setTimeout(() => {
                    const currentPathAfterReplace = window.location.pathname;
                    console.log(
                      `Current path after replace: ${currentPathAfterReplace}`,
                    );

                    // それでもパスが変わっていない場合は、強制的にリロード
                    if (currentPathAfterReplace !== path) {
                      console.log(
                        'Replace also failed, using window.location.href as final fallback',
                      );
                      window.location.href = path;
                    }
                  }, 300);
                } catch (replaceError) {
                  console.error('Replace error:', replaceError);
                  console.log(
                    'Using window.location.href due to replace error',
                  );
                  window.location.href = path;
                }
              }
            }, 500);
          } catch (error) {
            console.error('Navigation error:', error);
            // エラーが発生した場合は強制的にリロード
            console.log('Using window.location.href due to error');
            window.location.href = path;
          }
        };

        // 300ms後にナビゲーションを試行
        setTimeout(attemptNavigation, 300);

        // 安全のため、1秒後に強制的にリロード
        setTimeout(() => {
          if (!navigationAttempted) {
            console.log('Navigation timeout, using window.location.href');
            window.location.href = path;
          }
        }, 1000);
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
        try {
          console.log('Checking if user profile exists (profile mode)...');
          const exists = await checkUserExistsClient();
          console.log('Profile check result (profile mode):', exists);

          if (exists) {
            navigateWithFarcaster('/chat');
          }
        } catch (error) {
          console.error('Error checking user profile (profile mode):', error);
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
            try {
              console.log('Checking if user profile exists...');
              const exists = await checkUserExistsClient();
              console.log('Profile check result:', exists);

              if (exists) {
                console.log('Profile exists, redirecting to chat...');
                navigateWithFarcaster('/chat');
              } else {
                console.log(
                  'Profile does not exist, redirecting to profile creation...',
                );
                navigateWithFarcaster('/profile/create');
              }
            } catch (error) {
              console.error('Error checking user profile:', error);
              // エラーが発生した場合は、プロフィール作成ページにリダイレクト
              console.log(
                'Profile check failed, redirecting to profile creation as fallback...',
              );
              navigateWithFarcaster('/profile/create');
            }
            return;
          }

          // その他の認証が必要なページの場合
          if (pathname === '/' || pathname === '/profile/create') return;

          try {
            console.log('Checking if user profile exists (other pages)...');
            const exists = await checkUserExistsClient();
            console.log('Profile check result (other pages):', exists);

            if (!exists) {
              navigateWithFarcaster('/profile/create');
            }
          } catch (error) {
            console.error('Error checking user profile (other pages):', error);
            // エラーが発生した場合は、プロフィール作成ページにリダイレクト
            console.log(
              'Profile check failed, redirecting to profile creation as fallback...',
            );
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
