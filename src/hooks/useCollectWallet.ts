// import { usePrivy } from '@privy-io/react-auth'; // 一時的にコメントアウト
import { useAccount } from 'wagmi';

export const useCollectWallet = () => {
  const { address, isConnecting } = useAccount();
  // const { authenticated, user } = usePrivy(); // 一時的にコメントアウト
  const authenticated = false; // 一時的に固定値
  const user = null as { wallet?: { address?: string } } | null; // 一時的にnullに設定（型アサーション）

  // Privyのウォレットアドレスを取得
  const privyAddress = user?.wallet?.address;

  return {
    isConnected: authenticated,
    walletAddress: address || privyAddress,
    isLoading: isConnecting,
  };
};
