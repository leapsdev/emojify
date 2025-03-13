'use client';

import { checkUserExists } from '@/components/features/auth/action';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function RedirectIfUserExists() {
  const router = useRouter();

  useEffect(() => {
    const checkAndRedirect = async () => {
      const exists = await checkUserExists();
      if (exists) {
        router.push('/chat');
      }
    };

    checkAndRedirect();
  }, [router]);

  return null;
}
