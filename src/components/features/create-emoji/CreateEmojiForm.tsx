'use client';

interface WalletError {
  code: number;
}

function isWalletError(error: unknown): error is WalletError {
  return typeof error === 'object' && error !== null && 'code' in error;
}

import { EMOJI_CONTRACT_ADDRESS, EMOJI_CONTRACT_ABI, baseSepolia } from '@/lib/thirdweb';
import { useWallets } from '@privy-io/react-auth';
import { ThirdwebStorage } from '@thirdweb-dev/storage';
import { useState } from 'react';
import {
  createThirdwebClient,
  estimateGas,
  getContract,
  prepareContractCall,
  resolveMethod,
  sendTransaction,
  simulateTransaction,
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
  abi: EMOJI_CONTRACT_ABI,
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
    if (!selectedFile || !walletAddress || !embeddedWallet) return;

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

      // Step 3: NFTのミント用トランザクションを準備と送信
      try {
        // thirdwebのprepareContractCallを使用
        const transaction = prepareContractCall({
          contract,
          method: "mint",
          params: [
            walletAddress,
            BigInt(0),
            BigInt(1),
            metadataUrl,
            '0x' as `0x${string}`, // 最小限のバイトデータ
          ],
          value: BigInt(0), // 送信するETHの量
        });

        // ガスコストを推定
        try {
          const gasEstimate = await estimateGas({ transaction });
          console.log('推定ガス量:', gasEstimate);

          // 推定ガス量の1.5倍を設定
          const gasLimit = (gasEstimate * BigInt(15)) / BigInt(10);
          console.log('設定ガス量:', gasLimit);

          // トランザクションをシミュレート
          const simulationResult = await simulateTransaction({ transaction });
          console.log('シミュレーション結果:', simulationResult);

          // トランザクションの詳細を確認
          console.log('トランザクションの詳細:', transaction);

          // トランザクションを送信
          const provider = await embeddedWallet.getEthereumProvider();
          const { transactionHash } = await sendTransaction({
            account: {
              address: walletAddress as `0x${string}`,
              signMessage: async (message) => {
                const signature = await provider.request({
                  method: 'personal_sign',
                  params: [message, walletAddress],
                });
                return signature as `0x${string}`;
              },
              signTransaction: async (tx) => {
                const signedTx = await provider.request({
                  method: 'eth_signTransaction',
                  params: [
                    {
                      ...tx,
                      gas: gasLimit.toString(),
                    },
                  ],
                });
                return signedTx as `0x${string}`;
              },
              sendTransaction: async (tx) => {
                const txHash = await provider.request({
                  method: 'eth_sendTransaction',
                  params: [
                    {
                      ...tx,
                      gas: gasLimit.toString(),
                    },
                  ],
                });
                return {
                  transactionHash: txHash as `0x${string}`,
                };
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

          console.log('トランザクション成功！ハッシュ:', transactionHash);
          alert(
            `NFTの作成に成功しました！\nトランザクションハッシュ: ${transactionHash}`,
          );
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
