'use client';

import { useFileUpload } from './hooks/useFileUpload';
import { FileUpload } from './components/FileUpload';
import { CreateButton } from './components/CreateButton';
import { useState } from 'react';
import { mintEmojiNFT } from './action';
import { usePrivy } from '@privy-io/react-auth';

export function CreateEmojiForm() {
  const { selectedFile, preview, handleFileSelect } = useFileUpload();
  const [loading, setLoading] = useState(false);
  const { user } = usePrivy();
  const walletAddress = user?.wallet?.address;

  const handleCreate = async () => {
    if (!selectedFile || !walletAddress) return;

    try {
      setLoading(true);

      // 画像をIPFSにアップロード（この実装は後で追加）
      const imageUrl = 'ipfs://your-image-hash';

      // NFTをミント
      const result = await mintEmojiNFT({
        toAddress: walletAddress,
        supply: BigInt(1),
        metadata: {
          name: '絵文字NFT',
          description: '新しく作成した絵文字NFT',
          image: imageUrl,
        },
      });

      if (result.success) {
        console.log('NFTがミントされました:', result.transactionHash);
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
    <main className="bg-white">
      <div className="pt-14 max-w-md mx-auto px-4">
        <FileUpload preview={preview} onFileSelect={handleFileSelect} />
        <CreateButton
          disabled={!selectedFile || !walletAddress}
          onClick={handleCreate}
          loading={loading}
        />
      </div>
    </main>
  );
}
