'use client';

import { usePrivy } from '@privy-io/react-auth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useFarcasterMiniApp } from '@/hooks/useFarcasterMiniApp';
import { checkUserExists } from './action';

type Props = {
  mode: 'auth' | 'profile';
};

export const AuthRedirect = ({ mode }: Props) => {
  const { authenticated, user } = usePrivy();
  const { isReady } = useFarcasterMiniApp();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleAuthRedirect = async () => {
      // Farcaster Mini Appの初期化を待つ
      if (!isReady) return;

      // プロフィール作成ページの場合
      if (mode === 'profile') {
        const exists = await checkUserExists();
        if (exists) {
          router.push('/chat');
        }
        return;
      }

      // 認証関連のページの場合
      if (mode === 'auth') {
        if (pathname === '/' || pathname === '/profile/create') return;
        if (!authenticated || !user) return;

        const exists = await checkUserExists();
        if (!exists) {
          router.push('/profile/create');
        } else {
          router.push('/chat');
        }
      }
    };

    handleAuthRedirect();
  }, [authenticated, user, router, pathname, mode, isReady]);

  return null;
};
