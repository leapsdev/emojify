import { useUnifiedWallet } from '@/hooks/useUnifiedWallet';

export const useCollectWallet = () => {
  const { address, isConnected, isLoading } = useUnifiedWallet();

  return {
    isConnected,
    walletAddress: address,
    isLoading,
  };
};
