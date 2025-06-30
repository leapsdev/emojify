import { useWallets } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';

export const useCollectWallet = () => {
  const { wallets } = useWallets();
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    if (wallets.length > 0) {
      setIsConnected(true);
      setWalletAddress(wallets[0].address);
    } else {
      setIsConnected(false);
      setWalletAddress(null);
    }
  }, [wallets]);

  return {
    isConnected,
    walletAddress,
    isLoading: false,
  };
};
