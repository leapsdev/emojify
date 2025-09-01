import { config } from '@/lib/basename/wagmi';
import { emojiContract } from '@/lib/contracts';
import { createWalletClient, custom, type EIP1193Provider } from 'viem';
import { base, baseSepolia } from 'viem/chains';

export const useWagmiMint = () => {
  const mintNFT = async (
    walletAddress: string,
    getEthereumProvider: () => Promise<unknown>,
    metadataUrl: string,
  ) => {
    try {
      // PrivyのEthereum Providerを取得して使用
      const provider = await getEthereumProvider();
      console.log('Using Privy provider:', provider);

      if (!provider || typeof provider !== 'object' || !('request' in provider)) {
        throw new Error('Ethereum provider not available from Privy wallet');
      }

      // Privyプロバイダーを使ってViemのWalletClientを作成
      const isProd = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production';
      const chain = isProd ? base : baseSepolia;
      
      const walletClient = createWalletClient({
        account: walletAddress as `0x${string}`,
        chain,
        transport: custom(provider as EIP1193Provider),
      });

      console.log('Created wallet client:', walletClient);
      console.log('Contract details:', emojiContract);

      // WalletClientを使って直接コントラクトを実行
      const transactionHash = await walletClient.writeContract({
        ...emojiContract,
        functionName: 'registerNewEmoji',
        args: [
          walletAddress as `0x${string}`,
          metadataUrl,
          '0x' as `0x${string}`,
        ],
      });
      
      console.log('Transaction hash:', transactionHash);
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
