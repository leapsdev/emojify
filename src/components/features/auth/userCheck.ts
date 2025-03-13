'use client';

import { usePrivy } from '@privy-io/react-auth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { checkUserExists } from './action';

export const CheckUserExists = () => {
  const { authenticated, user } = usePrivy();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/') return;
    if (pathname === '/create-profile') return;

    // 認証済みユーザーのみ処理
    if (!authenticated || !user) return;

    // データベースにユーザーが存在するか確認するだけ
    checkUserExists().then((exists) => {
      if (!exists) {
        router.push('/create-profile');
      }
      return;
    });
  }, [authenticated, user, router, pathname]);

  return null;
};
