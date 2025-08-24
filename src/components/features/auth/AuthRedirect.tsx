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
      console.log('AuthRedirect: handleAuthRedirect called', {
        mode,
        pathname,
        authenticated,
        user: !!user,
        isReady
      });

      // Farcaster Mini Appの初期化を待つ
      if (!isReady) {
        console.log('AuthRedirect: Mini App not ready yet');
        return;
      }

      // プロフィール作成ページの場合
      if (mode === 'profile') {
        console.log('AuthRedirect: profile mode');
        const exists = await checkUserExists();
        console.log('AuthRedirect: user exists?', exists);
        if (exists) {
          console.log('AuthRedirect: redirecting to /chat from profile mode');
          router.push('/chat');
        }
        return;
      }

      // 認証関連のページの場合
      if (mode === 'auth') {
        console.log('AuthRedirect: auth mode');
        if (pathname === '/' || pathname === '/profile/create') {
          console.log('AuthRedirect: skipping redirect for root or profile/create page');
          return;
        }
        if (!authenticated || !user) {
          console.log('AuthRedirect: not authenticated or no user');
          return;
        }

        console.log('AuthRedirect: checking if user exists...');
        const exists = await checkUserExists();
        console.log('AuthRedirect: user exists?', exists);
        if (!exists) {
          console.log('AuthRedirect: redirecting to /profile/create');
          router.push('/profile/create');
        } else {
          console.log('AuthRedirect: redirecting to /chat');
          router.push('/chat');
        }
      }
    };

    handleAuthRedirect();
  }, [authenticated, user, router, pathname, mode, isReady]);

  return null;
};
