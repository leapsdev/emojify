import { useCallback, useEffect, useState } from 'react';
import type { Address } from 'viem';
import { type Basename, getBasename } from './basename';
import { useUser } from '@privy-io/react-auth';

export function useBasename(userId?: string) {
  const { user } = useUser();
  const [basename, setBasename] = useState<Basename | undefined>();
  
  const effectiveUserId = userId || user?.id;

  const fetchBasename = useCallback(async () => {
    if (!effectiveUserId) {
      return;
    }
    const response = await fetch(`/api/user/${effectiveUserId}`);
    const userData = await response.json();
    const wallet = userData.wallet
    if (!wallet?.address) {
      return;
    }
    const result = await getBasename(wallet.address as Address);
    if (result) {
      setBasename(result);
    }
    setBasename(wallet.address);
  }, [effectiveUserId]);

  useEffect(() => {
    fetchBasename();
  }, [fetchBasename]);

  return basename ?? null;
}