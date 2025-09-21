'use client';

import { useIsMiniApp } from '@/components/providers/AuthProvider';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { usePrivy } from '@privy-io/react-auth';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { checkUserExists } from './action';

type Props = {
  mode: 'auth' | 'profile';
};

export const AuthRedirect = ({ mode }: Props) => {
  const { authenticated: isPrivyAuthenticated, user: privyUser } = usePrivy();
  const {
    isFirebaseAuthenticated: isPrivyFirebaseAuthenticated,
    isLoading: isPrivyLoading,
  } = useFirebaseAuth();
  const { isMiniApp } = useIsMiniApp();

  const router = useRouter();
  const pathname = usePathname();

  // 認証状態に基づいてユーザーIDを取得するヘルパー関数
  const getUserId = useCallback((): string => {
    if (!isMiniApp && isPrivyAuthenticated && isPrivyFirebaseAuthenticated) {
      return privyUser?.id || '';
    }
    return '';
  }, [
    isMiniApp,
    isPrivyAuthenticated,
    isPrivyFirebaseAuthenticated,
    privyUser?.id,
  ]);

  useEffect(() => {
    const handleAuthRedirect = async () => {
      // ローディング中は何もしない
      if (isPrivyLoading) {
        return;
      }

      // プロフィール作成ページの場合
      if (mode === 'profile') {
        const userId = getUserId();

        if (userId) {
          const exists = await checkUserExists(userId);
          if (exists) {
            router.push('/chat');
          }
        }
        return;
      }

      // 認証関連のページの場合
      if (mode === 'auth') {
        const userId = getUserId();
        const isAuthenticated = !!userId;

        // ルートパス（/）の場合は何もしない
        if (pathname === '/') {
          return;
        }

        // その他の認証関連ページ
        if (pathname === '/profile/create') return;

        if (isAuthenticated && userId) {
          const exists = await checkUserExists(userId);
          if (!exists) {
            router.push('/profile/create');
          }
        }
      }
    };

    handleAuthRedirect();
  }, [getUserId, isPrivyLoading, router, pathname, mode]);

  return null;
};
