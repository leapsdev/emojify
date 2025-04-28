'use client';

import { usePrivy } from '@privy-io/react-auth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { checkUserExists } from './action';

type Props = {
  mode: 'auth' | 'profile';
};

export const AuthRedirect = ({ mode }: Props) => {
  const { authenticated, user, ready } = usePrivy();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!ready) return; // Privyの初期化完了を待つ

    const handleAuthRedirect = async () => {
      try {
        // プロフィール作成ページの場合
        if (mode === 'profile') {
          const exists = await checkUserExists();
          if (exists) {
            router.push('/chat');
          }
          setIsChecking(false);
          return;
        }

        // 認証関連のページの場合
        if (mode === 'auth') {
          if (pathname === '/' || pathname === '/profile/create') {
            setIsChecking(false);
            return;
          }
          if (!authenticated || !user) {
            setIsChecking(false);
            return;
          }

          const exists = await checkUserExists();
          if (!exists) {
            router.push('/profile/create');
          }
          setIsChecking(false);
        }
      } catch (error) {
        console.error('Auth redirect error:', error);
        setIsChecking(false);
      }
    };

    handleAuthRedirect();
  }, [authenticated, user, ready, router, pathname, mode]);

  // 初期化中はnullを返す（レイアウトシフトを防ぐ）
  if (isChecking) return null;

  return null;
};
