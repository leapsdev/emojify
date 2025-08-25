'use client';

import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { checkUserExists } from './action';

type Props = {
  mode: 'auth' | 'profile';
};

export const AuthRedirect = ({ mode }: Props) => {
  const {
    isAuthenticated,
    isLoading,
    isSynchronized,
    user,
    environment,
    error,
  } = useUnifiedAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 認証状態の同期が完了するまで待機
    if (isLoading || !isSynchronized) {
      return;
    }

    const handleAuthRedirect = async () => {
      try {
        // エラーがある場合はサインインページに戻す
        if (error) {
          console.error('AuthRedirect - Authentication error:', error);
          if (pathname !== '/') {
            router.push('/');
          }
          return;
        }

        // プロフィール作成ページの場合
        if (mode === 'profile') {
          if (!isAuthenticated) {
            router.push('/');
            return;
          }

          const exists = await checkUserExists();
          if (exists) {
            // Farcaster環境では/chatに、通常環境でも/chatにリダイレクト
            const redirectPath = '/chat';
            if (pathname !== redirectPath) {
              console.log(
                `AuthRedirect - Profile exists, redirecting to ${redirectPath}`,
              );
              router.push(redirectPath);
            }
          }
          return;
        }

        // 認証関連のページの場合
        if (mode === 'auth') {
          // 既に適切なページにいる場合は何もしない
          if (pathname === '/' || pathname === '/profile/create') {
            return;
          }

          // 認証されていない場合
          if (!isAuthenticated || !user) {
            if (pathname !== '/') {
              console.log(
                'AuthRedirect - Not authenticated, redirecting to signin',
              );
              router.push('/');
            }
            return;
          }

          // 認証されている場合、ユーザーの存在確認
          const exists = await checkUserExists();
          if (!exists) {
            if (pathname !== '/profile/create') {
              console.log(
                'AuthRedirect - User not exists, redirecting to profile creation',
              );
              router.push('/profile/create');
            }
          } else {
            // ユーザーが存在する場合、適切なページにリダイレクト
            const redirectPath = '/chat';
            if (
              pathname !== redirectPath &&
              !pathname.startsWith('/chat') &&
              !pathname.startsWith('/profile') &&
              !pathname.startsWith('/explore') &&
              !pathname.startsWith('/create-emoji') &&
              !pathname.startsWith('/choose-friends')
            ) {
              console.log(
                `AuthRedirect - User exists, redirecting to ${redirectPath}`,
              );
              router.push(redirectPath);
            }
          }
        }

        // Farcaster環境での追加ログ
        if (
          environment === 'farcaster' &&
          process.env.NODE_ENV === 'development'
        ) {
          console.log('AuthRedirect - Farcaster environment navigation:', {
            mode,
            pathname,
            isAuthenticated,
            userExists: user ? 'check required' : false,
            environment,
          });
        }
      } catch (error) {
        console.error('AuthRedirect - Error during redirect handling:', error);
        // エラーが発生した場合はサインインページにリダイレクト
        if (pathname !== '/') {
          router.push('/');
        }
      }
    };

    handleAuthRedirect();
  }, [
    isAuthenticated,
    isLoading,
    isSynchronized,
    user,
    router,
    pathname,
    mode,
    environment,
    error,
  ]);

  // デバッグ用の情報表示（開発環境のみ）
  if (process.env.NODE_ENV === 'development' && environment === 'farcaster') {
    return (
      <div className="fixed top-0 right-0 bg-blue-100 text-xs p-2 z-50 max-w-xs">
        <div>Auth: {isAuthenticated ? '✓' : '✗'}</div>
        <div>Loading: {isLoading ? '⏳' : '✓'}</div>
        <div>Sync: {isSynchronized ? '✓' : '⏳'}</div>
        <div>Env: {environment}</div>
        <div>Path: {pathname}</div>
        <div>Mode: {mode}</div>
        {error && <div className="text-red-600">Error: {error}</div>}
      </div>
    );
  }

  return null;
};
