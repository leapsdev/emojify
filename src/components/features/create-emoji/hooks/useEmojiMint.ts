import { config } from '@/lib/basename/wagmi';
import { emojiContract } from '@/lib/contracts';
import { useAccount, useWalletClient } from 'wagmi';

export const useEmojiMint = () => {
  const { data: walletClient } = useWalletClient({ config });
  const { address } = useAccount();

  const mintNFT = async (metadataUrl: string) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
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
