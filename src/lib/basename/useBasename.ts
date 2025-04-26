import { useWallets } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import type { Address } from 'viem';
import { type Basename, getBasename } from './basename';

const address = '0x783d21e4534521052cB96a772619BCaA1CDC6E3f';

export function useBasename() {
  const { wallets } = useWallets();
  const [basename, setBasename] = useState<Basename | undefined>();

  useEffect(() => {
    const fetchBasename = async () => {
      // 接続されているウォレットがある場合は最初のウォレットのアドレスを使用、
      // ない場合はデフォルトのアドレスを使用
      const currentAddress = wallets[0]?.address ?? address;
      try {
        const result = await getBasename(currentAddress as Address);
        setBasename(result);
      } catch (error) {
        console.error('Error fetching basename:', error);
      }
    };

    fetchBasename();
  }, [wallets]);

  // basenameが存在する場合はそれを、なければアドレスを返す
  return basename ?? wallets[0]?.address ?? address;
}
