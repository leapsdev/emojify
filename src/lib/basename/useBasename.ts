import { getWalletAddressesByUserId } from '@/lib/usePrivy';
import { useUser } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { type Basename, getBasename } from './basename';

export function useBasename(
  userId?: string,
  isProfile = false,
  address?: string,
) {
  const { user } = useUser();
  const [basename, setBasename] = useState<Basename | ''>('');

  useEffect(() => {
    const fetchData = async () => {
      // アドレスが直接指定されている場合はそれを使用
      if (address) {
        const result: Basename | undefined = await getBasename(
          address as `0x${string}`,
        );
        if (!result) {
          if (isProfile) {
            setBasename(address as Basename);
          } else {
            setBasename('');
          }
        } else {
          setBasename(result);
        }
        return;
      }

      // 従来のuserIdを使用する場合
      const effectiveUserId = userId || user?.id;
      if (!effectiveUserId) return;
      const addresses = await getWalletAddressesByUserId(effectiveUserId);
      const result: Basename | undefined = await getBasename(addresses[0]);
      if (!result) {
        if (isProfile) {
          setBasename(addresses[0] as Basename);
        } else {
          setBasename('');
        }
      } else {
        setBasename(result);
      }
    };
    fetchData();
  }, [userId, user?.id, address, isProfile]);
  return basename;
}