'use client';

interface WalletError {
  code: number;
}

function isWalletError(error: unknown): error is WalletError {
  return typeof error === 'object' && error !== null && 'code' in error;
}

import { EMOJI_CONTRACT_ADDRESS, baseSepolia } from '@/lib/thirdweb';
import { useWallets } from '@privy-io/react-auth';
import { ThirdwebStorage } from '@thirdweb-dev/storage';
import { type ChangeEvent, useState } from 'react';
import {
  createThirdwebClient,
  getContract,
  prepareContractCall,
} from 'thirdweb';
import { CreateButton } from './components/CreateButton';
import { FileUpload } from './components/FileUpload';
import { useFileUpload } from './hooks/useFileUpload';

// ThirdWebクライアントの初期化
const client = createThirdwebClient({
  clientId: 'af87b9c2acce067efa781dc3ea43644d',
});

// コントラクトの取得
const contract = getContract({
  client,
  chain: baseSepolia,
  address: EMOJI_CONTRACT_ADDRESS,
});

// ThirdwebStorageインスタンスの初期化
const storage = new ThirdwebStorage({
  clientId: 'af87b9c2acce067efa781dc3ea43644d',
});

// IPFSアップロード関数
const uploadToIPFS = async (file: File) => {
  const uri = await storage.upload(file);
  return uri;
};

export function CreateEmojiForm() {
  const { selectedFile, preview, handleFileSelect } = useFileUpload();
  const [loading, setLoading] = useState(false);
  const { wallets } = useWallets();
  const embeddedWallet = wallets.find(
    (wallet) => wallet.walletClientType === 'privy',
  );
  const walletAddress = embeddedWallet?.address;

  const handleCreate = async () => {
    if (!selectedFile || !walletAddress) return;

    try {
      setLoading(true);

      // IPFSのURLをhttpsに変換する関数
      const ipfsToHttp = (ipfsUrl: string) => {
        const hash = ipfsUrl.replace('ipfs://', '');
        return `https://ipfs.io/ipfs/${hash}`;
      };

      // Step 1: 画像をIPFSにアップロード
      const imageUrl = await uploadToIPFS(selectedFile);
      const imageHttpUrl = ipfsToHttp(imageUrl);
      alert(
        `画像のアップロードが完了しました。\n以下のURLで確認できます：\n${imageHttpUrl}`,
      );

      // Step 2: メタデータを作成してIPFSにアップロード
      const metadata = {
        name: '',
        description: '',
        image: imageUrl,
        attributes: [
          {
            trait_type: 'creator',
            value: walletAddress,
          },
        ],
      };

      const metadataUrl = await storage.upload(metadata);
      const metadataHttpUrl = ipfsToHttp(metadataUrl);
      alert(
        `メタデータのアップロードが完了しました。\n以下のURLで確認できます：\n${metadataHttpUrl}`,
      );
      console.log(metadataHttpUrl);

      // Step 3: NFTのミント用トランザクションを準備
      const metadataBytes = new TextEncoder().encode(metadataUrl);
      const metadataHex = `0x${Buffer.from(metadataBytes).toString('hex')}`;

      const transaction = prepareContractCall({
        contract,
        method:
          'function mint(address to, uint256 tokenId, uint256 amount, bytes data) payable',
        params: [
          walletAddress,
          BigInt(0), // tokenId will be auto-incremented by contract
          BigInt(1),
          metadataHex as `0x${string}`,
        ],
      });

      if (!embeddedWallet) {
        throw new Error('ウォレットが接続されていません');
      }

      // トランザクションを送信
      const provider = await embeddedWallet.getEthereumProvider();
      const transactionHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: walletAddress,
            to: transaction.to,
            data: transaction.data,
            value: transaction.value?.toString() || '0x0',
          },
        ],
      });

      // 成功したらフォームをリセット
      handleFileSelect({
        target: { files: null },
      } as ChangeEvent<HTMLInputElement>);

      alert(
        `NFTの作成に成功しました！\nトランザクションハッシュ: ${transactionHash}`,
      );
    } catch (error: unknown) {
      console.error('エラーが発生しました:', error);

      // ユーザーがトランザクションを拒否した場合
      if (isWalletError(error) && error.code === 4001) {
        alert(
          'トランザクションがキャンセルされました。\n※画像とメタデータはIPFSにアップロード済みです。',
        );
      } else {
        alert(
          'NFTの作成中にエラーが発生しました。もう一度お試しください。\n※画像とメタデータはIPFSにアップロード済みです。',
        );
      }
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
