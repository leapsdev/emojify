'use client';

import { useState } from 'react';
import { CreateButton } from './components/CreateButton';
import { FileUpload } from './components/FileUpload';
import { NoWalletWarning } from './components/NoWalletWarning';
import { useFileUpload } from './hooks/useFileUpload';
import { useIPFS } from './hooks/useIPFS';
import { useThirdwebMint } from './hooks/useThirdwebMint';
import { useWallet } from './hooks/useWallet';

export function CreateEmojiForm() {
  const { selectedFile, preview, handleFileSelect } = useFileUpload();
  const [loading, setLoading] = useState(false);
  const { selectedWalletAddress, noWalletWarning, getSelectedWallet } = useWallet();
  const { uploadToIPFS, ipfsToHttp, uploadMetadataToIPFS } = useIPFS();
  const { mintNFT } = useThirdwebMint();

  const handleCreate = async () => {
    if (!selectedFile || !selectedWalletAddress) return;

    const selectedWallet = getSelectedWallet();
    if (!selectedWallet) return;

    try {
      setLoading(true);

      // Step 1: 画像をIPFSにアップロード
      const imageUrl = await uploadToIPFS(selectedFile);
      const imageHttpUrl = ipfsToHttp(imageUrl);
      console.log(
        `Image upload completed.\nYou can check it at:\n${imageHttpUrl}\n${imageUrl}`,
      );

      // Step 2: メタデータを作成してIPFSにアップロード
      const metadataUrl = await uploadMetadataToIPFS(imageUrl, selectedWalletAddress);
      const metadataHttpUrl = ipfsToHttp(metadataUrl);
      console.log(`Metadata upload completed.\nYou can check it at:\n${metadataHttpUrl}`);

      // Step 3: NFTのミント
      await mintNFT(selectedWalletAddress, selectedWallet.getEthereumProvider.bind(selectedWallet));
      console.log('NFT minted successfully!');
    } catch (error) {
      console.error('An error occurred:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-14 max-w-md mx-auto px-4 space-y-4">
      <FileUpload preview={preview} onFileSelect={handleFileSelect} />
      <NoWalletWarning show={noWalletWarning} />
      <CreateButton
        disabled={!selectedFile || noWalletWarning}
        onClick={handleCreate}
        loading={loading}
      />
    </div>
  );
}
