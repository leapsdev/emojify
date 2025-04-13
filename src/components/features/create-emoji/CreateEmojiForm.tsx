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
      try {
        // thirdwebのprepareContractCallを使用
        const transaction = prepareContractCall({
          contract,
          method: "function mint(address to, uint256 tokenId, uint256 amount, string baseURI, bytes data) payable",
          params: [
            walletAddress,
            BigInt(0),
            BigInt(1),
            metadataUrl,
            "0x" as `0x${string}`, // 最小限のバイトデータ
          ],
        });
        
        console.log('Full Transaction:', transaction);
        
        // データが関数である場合は実行して取得
        let transactionData;
        if (typeof transaction.data === 'function') {
          try {
            transactionData = await transaction.data();
            console.log('Executed transaction data:', transactionData);
          } catch (dataError) {
            console.error('データ関数の実行エラー:', dataError);
            throw new Error('トランザクションデータの生成に失敗しました');
          }
        } else {
          transactionData = transaction.data;
        }
        
        if (!transactionData) {
          console.error('トランザクションデータがありません');
          throw new Error('トランザクションデータの生成に失敗しました');
        }
        
        const txRequest = {
          from: walletAddress,
          to: transaction.to,
          data: transactionData,
          gas: '0x55555', // 十分な量のガス
          maxFeePerGas: '0x2540be400', // 例: 10 Gwei
          maxPriorityFeePerGas: '0x3b9aca00', // 例: 1 Gwei
          // value を明示的に16進数文字列として設定
          value: '0x0',
          // 正しいチェーンIDを明示的に設定
          chainId: `0x${baseSepolia.id.toString(16)}` // Base SepoliaのチェーンID（84532）
        };

        console.log('Final Transaction Request:', txRequest);
        
        if (!embeddedWallet) {
          throw new Error('ウォレットが接続されていません');
        }
        
        // トランザクションを送信
        const provider = await embeddedWallet.getEthereumProvider();
        
        // トランザクションを送信前に確認
        console.log('送信するトランザクション:', {
          method: 'eth_sendTransaction',
          params: [txRequest]
        });
        
        const transactionHash = await provider.request({
          method: 'eth_sendTransaction',
          params: [txRequest]
        });
        
        console.log('トランザクション成功！ハッシュ:', transactionHash);
        
        alert(`NFTの作成に成功しました！\nトランザクションハッシュ: ${transactionHash}`);
      } catch (error: unknown) {
        console.error('トランザクションエラー:', error);
        
        // エラーメッセージを詳細に表示
        console.dir(error, { depth: null }); // エラーオブジェクトの詳細を表示
        
        // エラーメッセージを安全に取得
        let errorMessage = 'Unknown error';
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else if (error && typeof error === 'object') {
          try {
            errorMessage = JSON.stringify(error);
          } catch {
            if ('message' in error) {
              errorMessage = String((error as { message: unknown }).message);
            }
          }
        }
        
        alert(`NFTの作成中にエラーが発生しました: ${errorMessage}`);
      }
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
