import { useAccount } from 'wagmi';

export const useCollectWallet = () => {
  const { address, isConnected, isConnecting } = useAccount();

  return {
    isConnected,
    walletAddress: address,
    isLoading: isConnecting,
  };
};
