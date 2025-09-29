import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { config } from '@/lib/basename/wagmi';
import { useAccount, useWalletClient } from 'wagmi';

export const useWallet = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient({ config });
  const { isAuthenticated } = useUnifiedAuth();

  return {
    address,
    isConnected: isAuthenticated,
    walletClient,
  };
};
