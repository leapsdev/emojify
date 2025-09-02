import { Button } from '@/components/ui/Button';
import { LinkButton } from '@/components/ui/LinkButton';
import { Loading } from '@/components/ui/Loading';
import { TransactionResult } from '@/components/ui/TransactionResult';
import { config } from '@/lib/basename/wagmi';
import { emojiContract } from '@/lib/contracts';
import { readContract, writeContract } from '@wagmi/core';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';

interface Props {
  tokenId: string;
}

interface CollectResult {
  result: 'success' | 'error';
  transactionHash?: string;
}

export function CollectButton({ tokenId }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [collectResult, setCollectResult] = useState<CollectResult | null>(
    null,
  );
  const { data: walletClient } = useWalletClient({ config });
  const { address } = useAccount();

  const handleCollect = async () => {
    if (!walletClient || !address) {
      console.error('No wallet connected');
      return;
    }

    try {
      setIsLoading(true);
      setCollectResult(null);

      // Check if the current user is the first minter
      const firstMinterAddress = (await readContract(config, {
        ...emojiContract,
        functionName: 'firstMinter',
        args: [BigInt(tokenId)],
      })) as unknown as string;

      const isFirstMinter =
        firstMinterAddress.toLowerCase() === address.toLowerCase();

      const valueToSend = isFirstMinter ? BigInt(0) : BigInt('500000000000000'); // 0.0005 ETH in wei

      // NFTを取得
      const hash = await writeContract(config, {
        ...emojiContract,
        functionName: 'addEmojiSupply',
        args: [
          address as `0x${string}`,
          BigInt(tokenId),
          BigInt(1),
          '0x' as `0x${string}`,
        ],
        value: valueToSend,
      });

      setCollectResult({ result: 'success', transactionHash: hash });
    } catch (error: unknown) {
      setCollectResult({ result: 'error' });
      console.error('Collect error:', error);
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
          disabled={isLoading || !address}
        >
          {isLoading ? (
            <Loading size="sm" className="text-white" />
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
