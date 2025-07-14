import { config } from '@/lib/basename/wagmi';
import { emojiContract } from '@/lib/contracts';
import { writeContract } from '@wagmi/core';

export const useWagmiMint = () => {
  const mintNFT = async (
    walletAddress: string,
    _getEthereumProvider: () => Promise<unknown>, // 未使用
    metadataUrl: string,
  ) => {
    try {
      const transactionHash = await writeContract(config, {
        ...emojiContract,
        functionName: 'registerNewEmoji',
        args: [
          walletAddress as `0x${string}`,
          metadataUrl,
          '0x' as `0x${string}`,
        ],
        // value: BigInt('500000000000000'), // 必要に応じて有効化
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

  return {
    mintNFT,
  };
};
