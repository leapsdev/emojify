import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useAccount } from 'wagmi';

export const useCollectWallet = () => {
  const { address, isConnecting } = useAccount();
  const { isAuthenticated } = useUnifiedAuth();

  return {
    isConnected: isAuthenticated,
    walletAddress: address,
    isLoading: isConnecting,
  };
};
