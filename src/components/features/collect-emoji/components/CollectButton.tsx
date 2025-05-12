import { Button } from '@/components/ui/Button';
import { useToastRedirect } from '@/lib/hooks/useToastRedirect';
import {
  CLIENT_ID,
  EMOJI_CONTRACT_ABI,
  EMOJI_CONTRACT_ADDRESS,
  baseSepolia,
} from '@/lib/thirdweb';
import { useWallets } from '@privy-io/react-auth';
import { Plus } from 'lucide-react';
import { useState } from 'react';
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

interface Props {
  tokenId: string;
}

interface WalletError {
  code: number;
}

function isWalletError(error: unknown): error is WalletError {
  return typeof error === 'object' && error !== null && 'code' in error;
}

export function CollectButton({ tokenId }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const { wallets } = useWallets();
  const toastRedirect = useToastRedirect();
  const handleCollect = async () => {
    if (wallets.length === 0) {
      console.error('No wallet connected');
      return;
    }

    try {
      setIsLoading(true);
      const walletAddress = wallets[0].address;
      const provider = await wallets[0].getEthereumProvider();

      // NFTを取得
      const transaction = prepareContractCall({
        contract,
        method: 'addEmojiSupply',
        params: [walletAddress, BigInt(tokenId), BigInt(1), '0x'],
        value: BigInt('500000000000000'), // 0.0005 ETH in wei
      });

      await simulateTransaction({ transaction });

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

      console.log('NFT collected successfully!', transactionHash);
      toastRedirect('NFT collected successfully!', '/chat');
    } catch (error: unknown) {
      if (isWalletError(error) && error.code === 4001) {
        console.error('Transaction cancelled.');
      } else {
        console.error('Error collecting NFT:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-full py-6 text-lg font-bold mt-8"
      onClick={handleCollect}
      disabled={isLoading || wallets.length === 0}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
      ) : (
        <>
          <Plus className="w-5 h-5 mr-2" />
          Collect
        </>
      )}
    </Button>
  );
}
