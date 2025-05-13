import { getWalletAddressesByUserId } from '@/lib/usePrivy';
import { useUser } from '@privy-io/react-auth';
import { useCallback, useEffect, useState } from 'react';
import { type Basename, getBasename } from './basename';

// デバウンス用のタイマー
let debounceTimer: NodeJS.Timeout;

export function useBasename(
  userId?: string,
  isProfile = false,
  address?: string,
) {
  const { user } = useUser();
  const [basename, setBasename] = useState<Basename | ''>('');

  const fetchBasename = useCallback(
    async (addr: string) => {
      const result = await getBasename(addr as `0x${string}`);
      if (!result) {
        if (isProfile) {
          setBasename(addr as Basename);
        } else {
          setBasename('');
        }
      } else {
        setBasename(result);
      }
    },
    [isProfile],
  );

  useEffect(() => {
    const fetchData = async () => {
      // アドレスが直接指定されている場合はそれを使用
      if (address) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          fetchBasename(address);
        }, 300);
        return;
      }

      // 従来のuserIdを使用する場合
      const effectiveUserId = userId || user?.id;
      if (!effectiveUserId) return;

      const addresses = await getWalletAddressesByUserId(effectiveUserId);
      if (addresses.length > 0) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          fetchBasename(addresses[0]);
        }, 300);
      }
    };

    fetchData();

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [userId, user?.id, address, fetchBasename]);

  return basename;
}
