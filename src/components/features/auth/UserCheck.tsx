'use client';

import { usePrivy } from '@privy-io/react-auth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { checkUser } from './action';

export const UserCheck = () => {
  const { authenticated, user } = usePrivy();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // ルートパスでは実行しない
    if (pathname === '/') return;

    // 認証済みユーザーのみ処理
    if (!authenticated || !user) return;

    // データベースにユーザーが存在するか確認するだけ
    checkUser().then((redirectTo) => {
      if (redirectTo) {
        router.push(redirectTo);
      }
    });
  }, [authenticated, user, router, pathname]);

  return null;
};
