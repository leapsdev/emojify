import { getWalletAddressesByUserId } from '@/lib/usePrivy';
import { useUser } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { type Basename, getBasename } from './basename';

export function useBasename(userId?: string, isProfile = false) {
  const { user } = useUser();
  const [basename, setBasename] = useState<Basename | ''>('');

  useEffect(() => {
    const fetchData = async () => {
      const effectiveUserId = userId || user?.id;
      if (!effectiveUserId) return;
      const addresses = await getWalletAddressesByUserId(effectiveUserId);
      const result = await getBasename(addresses[0]);
      console.log('result', result);
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
  }, [userId, user?.id, isProfile]);
  return basename;
}
