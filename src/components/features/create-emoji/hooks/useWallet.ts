import { config } from '@/lib/basename/wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount, useWalletClient } from 'wagmi';

export const useWallet = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient({ config });
  const { authenticated, user } = usePrivy();

  // Privyのウォレットアドレスを取得
  const privyAddress = user?.wallet?.address;

  return {
    address: address || privyAddress,
    isConnected: authenticated,
    walletClient,
  };
};
