import { Button } from '@/components/ui/Button';
import { LinkButton } from '@/components/ui/LinkButton';
import { TransactionResult } from '@/components/ui/TransactionResult';
import {
  CLIENT_ID,
  EMOJI_CONTRACT_ABI,
  EMOJI_CONTRACT_ADDRESS,
  baseMainnet,
} from '@/lib/thirdweb';
import { usePrivy } from '@privy-io/react-auth';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import {
  createThirdwebClient,
  getContract,
  prepareContractCall,
  readContract,
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
  chain: baseMainnet,
  address: EMOJI_CONTRACT_ADDRESS,
  abi: EMOJI_CONTRACT_ABI,
});

interface Props {
  tokenId: string;
}

interface WalletError {
  code: number;
}

type CollectResult = {
  result: 'success' | 'error';
  transactionHash?: string;
} | null;

function isWalletError(error: unknown): error is WalletError {
  return typeof error === 'object' && error !== null && 'code' in error;
}

export function CollectButton({ tokenId }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [collectResult, setCollectResult] = useState<CollectResult>(null);
  const { wallets } = usePrivy();

  const handleCollect = async () => {
    if (wallets.length === 0) {
      console.error('No wallet connected');
      return;
    }

    try {
      setIsLoading(true);
      setCollectResult(null);
      const walletAddress = wallets[0].address;
      const provider = await wallets[0].getEthereumProvider();

      // Check if the current user is the first minter
      const firstMinterAddress = await readContract({
        contract,
        method: 'firstMinter',
        params: [BigInt(tokenId)],
      });

      const isFirstMinter =
        firstMinterAddress.toLowerCase() === walletAddress.toLowerCase();

      const valueToSend = isFirstMinter ? BigInt(0) : BigInt('500000000000000'); // 0.0005 ETH in wei

      // NFTを取得
      const transaction = prepareContractCall({
        contract,
        method: 'addEmojiSupply',
        params: [walletAddress, BigInt(tokenId), BigInt(1), '0x'],
        value: valueToSend,
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
          signTypedData: async (typedData) => {
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
      setCollectResult({
        result: 'success',
        transactionHash,
      });
    } catch (error: unknown) {
      if (isWalletError(error) && error.code === 4001) {
        console.error('Transaction cancelled.');
        setCollectResult({
          result: 'error',
        });
      } else {
        console.error('Error collecting NFT:', error);
        setCollectResult({
          result: 'error',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const buttonStyles =
    'w-full bg-gray-900 text-white rounded-full py-2 text-lg font-bold hover:bg-gray-800';

  return (
    <div className="space-y-4">
      {collectResult && (
        <TransactionResult
          result={collectResult.result}
          title={
            collectResult.result === 'success'
              ? 'Successfully collected!'
              : 'Failed to collect NFT'
          }
          message={
            collectResult.result === 'error'
              ? 'The transaction was rejected. Please try again.'
              : undefined
          }
          transactionHash={collectResult.transactionHash}
          explorerUrl={
            collectResult.transactionHash
              ? `https://basescan.org/tx/${collectResult.transactionHash}`
              : undefined
          }
        />
      )}

      {collectResult ? (
        <LinkButton
          href="/explore"
          content="Back to Explore"
          className={buttonStyles}
        />
      ) : (
        <Button
          className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-full py-6 text-lg font-bold mt-8"
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
      )}
    </div>
  );
}
