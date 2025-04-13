'use client';

import { EMOJI_CONTRACT_ADDRESS } from '@/lib/thirdweb';
import { useWallets } from '@privy-io/react-auth';
import { useState } from 'react';
import { useWriteContract } from 'wagmi';
import { CreateButton } from './components/CreateButton';
import { FileUpload } from './components/FileUpload';
import { useFileUpload } from './hooks/useFileUpload';

export function CreateEmojiForm() {
  const { selectedFile, preview, handleFileSelect } = useFileUpload();
  const [loading, setLoading] = useState(false);
  const { wallets } = useWallets();
  const embeddedWallet = wallets.find(
    (wallet) => wallet.walletClientType === 'privy',
  );
  const walletAddress = embeddedWallet?.address;

  const { writeContract } = useWriteContract();

  const handleCreate = async () => {
    if (!selectedFile || !walletAddress) return;

    try {
      setLoading(true);

      // Step 1: NFTのミント
      writeContract({
        address: EMOJI_CONTRACT_ADDRESS as `0x${string}`,
        abi: [
          {
            name: 'mint',
            type: 'function',
            stateMutability: 'payable',
            inputs: [
              { name: 'to', type: 'address' },
              { name: 'tokenId', type: 'uint256' },
              { name: 'amount', type: 'uint256' },
              { name: 'baseURI', type: 'string' },
              { name: 'data', type: 'bytes' },
            ],
            outputs: [],
          },
        ],
        functionName: 'mint',
        args: [
          walletAddress as `0x${string}`,
          BigInt(0),
          BigInt(1),
          'test',
          '0x' as `0x${string}`,
        ],
        gas: BigInt(100000), // ガス制限を設定
      });
    } catch (error) {
      console.error('エラーが発生しました:', error);
      alert('トランザクションの送信中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-14 max-w-md mx-auto px-4 space-y-4">
      <FileUpload preview={preview} onFileSelect={handleFileSelect} />
      <CreateButton
        disabled={!selectedFile || !walletAddress}
        onClick={handleCreate}
        loading={loading}
      />
    </div>
  );
}
