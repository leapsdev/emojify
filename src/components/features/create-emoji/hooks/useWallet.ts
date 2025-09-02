import { config } from '@/lib/basename/wagmi';
import { useAccount, useWalletClient } from 'wagmi';

export const useWallet = () => {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient({ config });

  return {
    address,
    isConnected,
    walletClient,
  };
};
