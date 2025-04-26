import { useWallets } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import type { Address } from 'viem';
import { type Basename, getBasename } from './basename';

export function useBasename() {
  const { wallets } = useWallets();
  const [basename, setBasename] = useState<Basename | undefined>();

  useEffect(() => {
    const fetchBasename = async () => {
      // 接続されているウォレットがある場合は最初のウォレットのアドレスを使用
      const address = wallets[0]?.address;
      if (address) {
        try {
          const result = await getBasename(address as Address);
          setBasename(result);
        } catch (error) {
          console.error('Error fetching basename:', error);
        }
      }
    };

    if (wallets.length > 0) {
      fetchBasename();
    }
  }, [wallets]);

  // basenameが存在する場合はそれを、なければウォレットアドレスを返す
  return basename ?? wallets[0]?.address ?? null;
}
