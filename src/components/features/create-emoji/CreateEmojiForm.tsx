'use client';

interface WalletError {
  code: number;
}

function isWalletError(error: unknown): error is WalletError {
  return typeof error === 'object' && error !== null && 'code' in error;
}

import {
  CLIENT_ID,
  EMOJI_CONTRACT_ABI,
  EMOJI_CONTRACT_ADDRESS,
  baseSepolia,
} from '@/lib/thirdweb';
import { useWallets } from '@privy-io/react-auth';
import { ThirdwebStorage } from '@thirdweb-dev/storage';
import { useEffect, useState } from 'react';
import {
  createThirdwebClient,
  estimateGas,
  getContract,
  prepareContractCall,
  sendTransaction,
  simulateTransaction,
} from 'thirdweb';
import { CreateButton } from './components/CreateButton';
import { FileUpload } from './components/FileUpload';
import { useFileUpload } from './hooks/useFileUpload';

// ThirdWebクライアントの初期化
const client = createThirdwebClient({
  clientId: CLIENT_ID,
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
  clientId: CLIENT_ID,
});

// IPFSアップロード関数
const uploadToIPFS = async (file: File) => {
  const uri = await storage.upload(file);
  return uri;
};

// IPFSのURLをhttpsに変換する関数
const ipfsToHttp = (ipfsUrl: string) => {
  const hash = ipfsUrl.replace('ipfs://', '');
  return `https://ipfs.io/ipfs/${hash}`;
};

export function CreateEmojiForm() {
  const { selectedFile, preview, handleFileSelect } = useFileUpload();
  const [loading, setLoading] = useState(false);
  const { wallets } = useWallets();
  const [selectedWalletAddress, setSelectedWalletAddress] = useState<string>('');
  const [noWalletWarning, setNoWalletWarning] = useState(false);

  // 利用可能な最初のウォレットを選択
  useEffect(() => {
    if (wallets.length > 0) {
      setSelectedWalletAddress(wallets[0].address);
      setNoWalletWarning(false);
    } else {
      setSelectedWalletAddress('');
      setNoWalletWarning(true);
    }
  }, [wallets]);

  // ウォレットが存在しない場合の警告メッセージ
  const NoWalletWarning = () => {
    if (!noWalletWarning) return null;
    return (
      <div className="rounded-md bg-yellow-50 p-4 mb-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              No wallet connected
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                A connected wallet is required to create an NFT.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleCreate = async () => {
    if (!selectedFile || !selectedWalletAddress) return;

    const selectedWallet = wallets.find(
      (wallet) => wallet.address === selectedWalletAddress,
    );

    if (!selectedWallet) return;

    try {
      setLoading(true);

      // Step 1: 画像をIPFSにアップロード
      const imageUrl = await uploadToIPFS(selectedFile);
      const imageHttpUrl = ipfsToHttp(imageUrl);
      console.log(
        `Image upload completed.\nYou can check it at:\n${imageHttpUrl}
        \n ${imageUrl}`,
      );

      // Step 2: メタデータを作成してIPFSにアップロード
      const tokenId = BigInt(11); // トークンIDを設定

      const metadata = {
        name: '',
        description: '',
        image: imageUrl,
        attributes: [
          {
            trait_type: 'creator',
            value: selectedWalletAddress,
          },
        ],
      };

      const metadataUrl = await storage.upload(metadata);
      const metadataHttpUrl = ipfsToHttp(metadataUrl);
      console.log(
        `Metadata upload completed.\nYou can check it at:\n${metadataHttpUrl}`,
      );

      // Step 3: NFTのミント用トランザクションを準備と送信
      try {
        console.log('Contract:', contract);
        const transaction = prepareContractCall({
          contract,
          method: 'mint',
          params: [
            selectedWalletAddress, // to: 受信者のアドレス
            tokenId, // tokenId: トークンID
            BigInt(1), // amount: ミントする数量
            '0x' as `0x${string}`, // data: 空のバイト列
          ],
        });

        // ガスコストを推定
        try {
          const gasEstimate = await estimateGas({ transaction });
          console.log('Estimated gas:', gasEstimate);

          // 推定ガス量の1.5倍を設定
          const gasLimit = (gasEstimate * BigInt(15)) / BigInt(10);
          console.log('Set gas limit:', gasLimit);

          // トランザクションをシミュレート
          const simulationResult = await simulateTransaction({ transaction });
          console.log('Simulation result:', simulationResult);

          // トランザクションの詳細を確認
          console.log('Transaction details:', transaction);

          // トランザクションを送信
          const provider = await selectedWallet.getEthereumProvider();
          const { transactionHash } = await sendTransaction({
            account: {
              address: selectedWalletAddress as `0x${string}`,
              signMessage: async (message) => {
                const signature = await provider.request({
                  method: 'personal_sign',
                  params: [message, selectedWalletAddress],
                });
                return signature as `0x${string}`;
              },
              signTransaction: async (tx) => {
                // トランザクションデータを取得
                const txData =
                  typeof tx.data === 'function'
                    ? await (tx.data as () => Promise<string>)()
                    : tx.data;

                // BigInt を 16進数文字列に変換
                const params = {
                  from: selectedWalletAddress,
                  to: tx.to,
                  data: txData,
                  gasLimit: `0x${gasLimit.toString(16)}`,
                  type: tx.type ? Number(tx.type) : undefined,
                  nonce: tx.nonce ? Number(tx.nonce) : undefined,
                  value: tx.value
                    ? `0x${BigInt(tx.value).toString(16)}`
                    : '0x0',
                  maxFeePerGas: tx.maxFeePerGas
                    ? `0x${BigInt(tx.maxFeePerGas).toString(16)}`
                    : undefined,
                  maxPriorityFeePerGas: tx.maxPriorityFeePerGas
                    ? `0x${BigInt(tx.maxPriorityFeePerGas).toString(16)}`
                    : undefined,
                };

                const signedTx = await provider.request({
                  method: 'eth_signTransaction',
                  params: [params],
                });
                return signedTx as `0x${string}`;
              },
              sendTransaction: async (tx) => {
                // トランザクションデータを取得
                const txData =
                  typeof tx.data === 'function'
                    ? await (tx.data as () => Promise<string>)()
                    : tx.data;

                // BigInt を 16進数文字列に変換
                const params = {
                  from: selectedWalletAddress,
                  to: tx.to,
                  data: txData,
                  gasLimit: `0x${gasLimit.toString(16)}`,
                  type: tx.type ? Number(tx.type) : undefined,
                  nonce: tx.nonce ? Number(tx.nonce) : undefined,
                  value: tx.value
                    ? `0x${BigInt(tx.value).toString(16)}`
                    : '0x0',
                  maxFeePerGas: tx.maxFeePerGas
                    ? `0x${BigInt(tx.maxFeePerGas).toString(16)}`
                    : undefined,
                  maxPriorityFeePerGas: tx.maxPriorityFeePerGas
                    ? `0x${BigInt(tx.maxPriorityFeePerGas).toString(16)}`
                    : undefined,
                };

                const txHash = await provider.request({
                  method: 'eth_sendTransaction',
                  params: [params],
                });
                return {
                  transactionHash: txHash as `0x${string}`,
                };
              },
              signTypedData: async (typedData) => {
                const signature = await provider.request({
                  method: 'eth_signTypedData',
                  params: [selectedWalletAddress, typedData],
                });
                return signature as `0x${string}`;
              },
            },
            transaction,
          });

          console.log('Transaction successful! Hash:', transactionHash);
        } catch (error: unknown) {
          console.error('Transaction error:', error);

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

          console.log(`Error occurred while creating NFT: ${errorMessage}`);
        }
      } catch (error: unknown) {
        console.error('An error occurred:', error);

        // ユーザーがトランザクションを拒否した場合
        if (isWalletError(error) && error.code === 4001) {
          console.log(
            'Transaction cancelled.\n※Image and metadata have already been uploaded to IPFS.',
          );
        } else {
          console.log(
            'An error occurred while creating NFT. Please try again.\n※Image and metadata have already been uploaded to IPFS.',
          );
        }
      } finally {
        setLoading(false);
      }
    } catch (error: unknown) {
      console.error('An error occurred:', error);

      // ユーザーがトランザクションを拒否した場合
      if (isWalletError(error) && error.code === 4001) {
        console.log(
          'Transaction cancelled.\n※Image and metadata have already been uploaded to IPFS.',
        );
      } else {
        console.log(
          'An error occurred while creating NFT. Please try again.\n※Image and metadata have already been uploaded to IPFS.',
        );
      }
    }
  };

  return (
    <div className="pt-14 max-w-md mx-auto px-4 space-y-4">
      <FileUpload preview={preview} onFileSelect={handleFileSelect} />
      <NoWalletWarning />
      <CreateButton
        disabled={!selectedFile || noWalletWarning}
        onClick={handleCreate}
        loading={loading}
      />
    </div>
  );
}
