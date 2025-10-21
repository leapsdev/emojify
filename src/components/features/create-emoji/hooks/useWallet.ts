import { useUnifiedWallet } from '@/hooks/useUnifiedWallet';

export const useWallet = () => {
  const { address, isConnected, walletClient, isLoading, error } =
    useUnifiedWallet();

  return {
    address,
    isConnected,
    walletClient,
    isLoading,
    error,
  };
};
