'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useState } from 'react';
import { EMOJI_CONTRACT_ADDRESS } from '@/lib/thirdweb';
import { mintEmojiNFT, uploadToIPFS } from './action';
import { CreateButton } from './components/CreateButton';
import { FileUpload } from './components/FileUpload';
import { useFileUpload } from './hooks/useFileUpload';

export function CreateEmojiForm() {
  const { selectedFile, preview, handleFileSelect } = useFileUpload();
  const [loading, setLoading] = useState(false);
  const { user } = usePrivy();
  const walletAddress = user?.wallet?.address;

  const handleCreate = async () => {
    if (!selectedFile || !walletAddress) return;

    try {
      setLoading(true);
      
      console.log('NFTミント開始:', {
        walletAddress,
        contractAddress: EMOJI_CONTRACT_ADDRESS
      });

      // FormDataの作成
      const formData = new FormData();
      formData.append('file', selectedFile);

      // 画像をIPFSにアップロード
      const uploadResult = await uploadToIPFS(formData);
      
      if (!uploadResult.success || !uploadResult.uri) {
        throw new Error(uploadResult.error || 'IPFSへのアップロードに失敗しました');
      }

      // NFTをミント
      const result = await mintEmojiNFT({
        toAddress: walletAddress,
        supply: BigInt(1),
        metadata: {
          name: '絵文字NFT',
          description: '新しく作成した絵文字NFT',
          image: uploadResult.uri,
        },
      });

      if (result.success) {
        console.log('NFTがミントされました:', {
          transactionHash: result.transactionHash,
          contractAddress: EMOJI_CONTRACT_ADDRESS,
          imageUri: uploadResult.uri
        });
        // 成功時の処理（通知など）
      } else {
        console.error('NFTのミントに失敗しました:', result.error);
        // エラー時の処理（通知など）
      }
    } catch (error) {
      console.error('エラーが発生しました:', error);
      // エラー時の処理（通知など）
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-14 max-w-md mx-auto px-4">
      <FileUpload preview={preview} onFileSelect={handleFileSelect} />
      <CreateButton
        disabled={!selectedFile || !walletAddress}
        onClick={handleCreate}
        loading={loading}
      />
    </div>
  );
}
