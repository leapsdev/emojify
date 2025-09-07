import { config } from '@/lib/basename/wagmi';
import { emojiContract } from '@/lib/contracts';
import { useAccount, useSwitchChain, useWalletClient } from 'wagmi';

export const useEmojiMint = () => {
  const { data: walletClient } = useWalletClient({ config });
  const { address, chainId } = useAccount();
  const { switchChain } = useSwitchChain();

  const mintNFT = async (metadataUrl: string) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    // 期待されるチェーンIDを取得
    const expectedChainId =
      process.env.NEXT_PUBLIC_ENVIRONMENT === 'production' ? 8453 : 84532;

    // チェーンが正しくない場合は切り替える
    if (chainId !== expectedChainId) {
      try {
        await switchChain({ chainId: expectedChainId });
      } catch {
        const chainName =
          process.env.NEXT_PUBLIC_ENVIRONMENT === 'production'
            ? 'Base'
            : 'Base Sepolia';
        throw new Error(`Please switch to ${chainName} network in your wallet`);
      }
    }

    try {
      const transactionHash = await walletClient.writeContract({
        ...emojiContract,
        functionName: 'registerNewEmoji',
        args: [address as `0x${string}`, metadataUrl, '0x' as `0x${string}`],
      });

      return { transactionHash: transactionHash as string };
    } catch (error: unknown) {
      const e = error as { code?: number; message?: string };
      if (e.code === 4001) {
        throw new Error('Transaction cancelled.');
      }
      console.error('Transaction error:', error);
      throw new Error(e.message || 'Transaction failed with unknown error');
    }
  };

  return { mintNFT };
};
