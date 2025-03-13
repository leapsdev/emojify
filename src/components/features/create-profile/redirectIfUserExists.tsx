'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { checkUserExists } from '@/components/features/auth/action';

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