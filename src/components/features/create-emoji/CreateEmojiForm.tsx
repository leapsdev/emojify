'use client';

import { LinkButton } from '@/components/ui/LinkButton';
import { TransactionResult } from '@/components/ui/TransactionResult';
import { EMOJI_CONTRACT_ADDRESS } from '@/lib/thirdweb';
import { useState } from 'react';
import { CreateButton } from './components/CreateButton';
import { FileUpload } from './components/FileUpload';
import { NoWalletWarning } from './components/NoWalletWarning';
import { useFileUpload } from './hooks/useFileUpload';
import { useIPFS } from './hooks/useIPFS';
import { useThirdwebMint } from './hooks/useThirdwebMint';
import { useWallet } from './hooks/useWallet';

type MintResult = {
  result: 'success' | 'error';
  transactionHash?: string;
} | null;

export function CreateEmojiForm() {
  const { selectedFile, preview, handleFileSelect } = useFileUpload();
  const [loading, setLoading] = useState(false);
  const [mintResult, setMintResult] = useState<MintResult>(null);
  const { selectedWalletAddress, noWalletWarning, getSelectedWallet } =
    useWallet();
  const { uploadToIPFS, ipfsToHttp, uploadMetadataToIPFS } = useIPFS();
  const { mintNFT } = useThirdwebMint();

  const handleCreate = async () => {
    if (!selectedFile || !selectedWalletAddress) return;

    const selectedWallet = getSelectedWallet();
    if (!selectedWallet) return;

    try {
      setLoading(true);
      setMintResult(null);

      // Step 1: 画像をIPFSにアップロード
      const imageUrl = await uploadToIPFS(selectedFile);
      const imageHttpUrl = ipfsToHttp(imageUrl);
      console.log(
        `Image upload completed.\nYou can check it at:\n${imageHttpUrl}\n${imageUrl}`,
      );

      // Step 2: メタデータを作成してIPFSにアップロード
      const metadataUrl = await uploadMetadataToIPFS(
        imageUrl,
        selectedWalletAddress,
      );
      console.log(`metadataUrl: ${metadataUrl}`);
      const metadataHttpUrl = ipfsToHttp(metadataUrl);
      console.log(
        `Metadata upload completed.\nYou can check it at:\n${metadataHttpUrl}`,
      );

      // Step 3: NFTのミント
      const { transactionHash } = await mintNFT(
        selectedWalletAddress,
        async () => {
          const provider = await selectedWallet.getEthereumProvider();
          return {
            request: async (params: {
              method: string;
              params?: Array<
                | string
                | number
                | boolean
                | Record<string, unknown>
                | Array<unknown>
              >;
            }) => {
              const result = await provider.request(params);
              return result as string;
            },
          };
        },
        metadataUrl,
      );
      console.log('NFT minted successfully!');
      console.log('Transaction Hash:', transactionHash);
      console.log(
        'View on OpenSea:',
        `https://testnets.opensea.io/ja/${EMOJI_CONTRACT_ADDRESS}/${selectedWalletAddress}`,
      );
      setMintResult({
        result: 'success',
        transactionHash,
      });
    } catch (error) {
      console.error('An error occurred:', error);
      setMintResult({
        result: 'error',
      });
      if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      } else {
        alert('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const buttonStyles =
    'w-full bg-gray-900 text-white rounded-full py-2 text-lg font-bold hover:bg-gray-800';

  return (
    <div className="pt-14 max-w-md mx-auto px-4 space-y-4">
      <FileUpload preview={preview} onFileSelect={handleFileSelect} />
      <NoWalletWarning show={noWalletWarning} />

      {mintResult && (
        <TransactionResult
          result={mintResult.result}
          title={
            mintResult.result === 'success'
              ? 'Successfully minted!'
              : 'Failed to mint NFT'
          }
          message={
            mintResult.result === 'error'
              ? 'The transaction was rejected. Please try again.'
              : undefined
          }
          transactionHash={mintResult.transactionHash}
          explorerUrl={
            mintResult.transactionHash
              ? `https://basescan.org/tx/${mintResult.transactionHash}`
              : undefined
          }
        />
      )}

      {mintResult ? (
        <LinkButton
          href="/chat"
          content="Back to Chat"
          className={buttonStyles}
        />
      ) : (
        <CreateButton
          disabled={!selectedFile || noWalletWarning}
          onClick={handleCreate}
          loading={loading}
        />
      )}
    </div>
  );
}
