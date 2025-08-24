'use client';

import { useFarcasterMiniApp } from '@/hooks/useFarcasterMiniApp';
import { usePrivy } from '@privy-io/react-auth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { checkUserExists } from './action';

type Props = {
  mode: 'auth' | 'profile';
};

export const AuthRedirect = ({ mode }: Props) => {
  const { authenticated, user } = usePrivy();
  const router = useRouter();
  const pathname = usePathname();
  const { isReady, context } = useFarcasterMiniApp();

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
          // Farcaster環境でのナビゲーション
          if (context) {
            console.log(
              'Farcaster context detected, using mini app navigation',
            );
            // Farcaster環境では遅延を入れてからナビゲーション
            setTimeout(() => {
              router.push('/chat');
            }, 100);
          } else {
            router.push('/chat');
          }
        }
        return;
      }

      // 認証関連のページの場合
      if (mode === 'auth') {
        if (pathname === '/' || pathname === '/profile/create') return;
        if (!authenticated || !user) return;

        const exists = await checkUserExists();
        if (!exists) {
          // Farcaster環境でのナビゲーション
          if (context) {
            console.log(
              'Farcaster context detected, using mini app navigation',
            );
            // Farcaster環境では遅延を入れてからナビゲーション
            setTimeout(() => {
              router.push('/profile/create');
            }, 100);
          } else {
            router.push('/profile/create');
          }
        }
      }
    };

    handleAuthRedirect();
  }, [authenticated, user, router, pathname, mode, isReady, context]);

  return null;
};
