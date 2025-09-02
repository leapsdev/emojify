import { usePrivy } from '@privy-io/react-auth';
import { useAccount } from 'wagmi';

export const useCollectWallet = () => {
  const { address, isConnecting } = useAccount();
  const { authenticated, user } = usePrivy();

  // Privyのウォレットアドレスを取得
  const privyAddress = user?.wallet?.address;

  return {
    isConnected: authenticated,
    walletAddress: address || privyAddress,
    isLoading: isConnecting,
  };
};
