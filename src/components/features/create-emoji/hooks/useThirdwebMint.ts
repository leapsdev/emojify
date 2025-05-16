import {
  CLIENT_ID,
  EMOJI_CONTRACT_ABI,
  EMOJI_CONTRACT_ADDRESS,
  baseSepolia,
} from '@/lib/thirdweb';
import {
  createThirdwebClient,
  getContract,
  prepareContractCall,
  sendTransaction,
  simulateTransaction,
} from 'thirdweb';

// ThirdWebクライアントの初期化
const client = createThirdwebClient({
  clientId: CLIENT_ID,
});

// コントラクトの取得
const contract = getContract({
  client,
  chain: baseSepolia,
  address: EMOJI_CONTRACT_ADDRESS,
  abi: EMOJI_CONTRACT_ABI,
});

interface WalletError {
  code: number;
}

function isWalletError(error: unknown): error is WalletError {
  return typeof error === 'object' && error !== null && 'code' in error;
}

export const useThirdwebMint = () => {
  const mintNFT = async (
    walletAddress: string,
    getEthereumProvider: () => Promise<{
      request: (params: {
        method: string;
        params: unknown[];
      }) => Promise<string>;
    }>,
    metadataUrl: string,
  ) => {
    try {
      // NFTを作成
      const transaction = prepareContractCall({
        contract,
        method: 'registerNewEmoji',
        params: [walletAddress, metadataUrl, '0x'],
        // value: BigInt('500000000000000'), // 0.0005 ETH in wei // firstMinterはかからない
      });

      await simulateTransaction({ transaction });

      const provider = await getEthereumProvider();
      const { transactionHash } = await sendTransaction({
        account: {
          address: walletAddress as `0x${string}`,
          signMessage: async ({ message }) => {
            const signature = await provider.request({
              method: 'personal_sign',
              params: [message, walletAddress],
            });
            return signature as `0x${string}`;
          },
          signTransaction: async (tx: {
            to?: string | null;
            data?: string | (() => Promise<string>);
            value?: bigint;
          }) => {
            const data =
              typeof tx.data === 'function' ? await tx.data() : tx.data;
            return (await provider.request({
              method: 'eth_signTransaction',
              params: [
                {
                  from: walletAddress,
                  to: tx.to,
                  data,
                  value: tx.value ? `0x${tx.value.toString(16)}` : '0x0',
                },
              ],
            })) as `0x${string}`;
          },
          sendTransaction: async (tx: {
            to?: string | null;
            data?: string | (() => Promise<string>);
            value?: bigint;
          }) => {
            const txHash = await provider.request({
              method: 'eth_sendTransaction',
              params: [
                {
                  from: walletAddress,
                  to: tx.to || '',
                  data: tx.data
                    ? typeof tx.data === 'function'
                      ? await tx.data()
                      : tx.data
                    : '0x',
                  value: tx.value ? `0x${tx.value.toString(16)}` : '0x0',
                },
              ],
            });
            return { transactionHash: txHash as `0x${string}` };
          },
          signTypedData: async (typedData: unknown) => {
            const signature = await provider.request({
              method: 'eth_signTypedData',
              params: [walletAddress, typedData],
            });
            return signature as `0x${string}`;
          },
        },
        transaction,
      });

      return { transactionHash };
    } catch (error: unknown) {
      if (isWalletError(error) && error.code === 4001) {
        throw new Error('Transaction cancelled.');
      }
      console.error('Transaction error:', error);
      if (error instanceof Error) {
        throw new Error(`Transaction failed: ${error.message}`);
      }
      throw new Error('Transaction failed with unknown error');
    }
  };

  return {
    mintNFT,
  };
};
