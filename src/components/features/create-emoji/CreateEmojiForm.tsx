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
import { useState } from 'react';
import {
  createThirdwebClient,
  getContract,
  prepareContractCall,
  sendTransaction,
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
  const [selectedWalletAddress, setSelectedWalletAddress] =
    useState<string>('');

  console.log(wallets);
  // ウォレット選択用のUIコンポーネント
  const WalletSelector = () => {
    return (
      <div className="space-y-2">
        <label
          htmlFor="wallet-select"
          className="block text-sm font-medium text-gray-700"
        >
          使用するウォレットを選択してください
        </label>
        <select
          id="wallet-select"
          value={selectedWalletAddress}
          onChange={(e) => setSelectedWalletAddress(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">ウォレットを選択</option>
          {wallets.map((wallet, index) => {
            // ウォレットタイプの表示名を設定
            let walletType = wallet.meta.name;
            if (wallet.walletClientType === 'privy') {
              walletType = 'Embedded Wallet';
            }

            const displayAddress = `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`;
            const chainId = wallet.chainId.split(':')[1]; // "eip155:1" -> "1"

            return (
              <option
                key={`${wallet.address}-${wallet.walletClientType}-${index}`}
                value={wallet.address}
              >
                {`${walletType} (Chain: ${chainId}) - ${displayAddress}`}
              </option>
            );
          })}
        </select>
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
        `画像のアップロードが完了しました。\n以下のURLで確認できます：\n${imageHttpUrl}
        \n ${imageUrl}`,
      );

      // Step 2: メタデータを作成してIPFSにアップロード
      const tokenId = BigInt(10); // トークンIDを設定

      const metadata = {
        name: `Emoji #${tokenId.toString()}`,
        description: `Emoji NFT #${tokenId.toString()}`,
        image: imageUrl,
        attributes: [
          {
            trait_type: 'creator',
            value: selectedWalletAddress,
          },
        ],
      };

      // メタデータをIPFSにアップロード
      const metadataUrl = await storage.upload(metadata);
      const metadataHttpUrl = ipfsToHttp(metadataUrl);
      console.log(
        `メタデータのアップロードが完了しました。\n以下のURLで確認できます：\n${metadataHttpUrl}`,
      );

      // Step 3: NFTのミント用トランザクションを準備と送信
      try {
        console.log('コントラクト:', contract);

        // ガスリミットを設定
        const gasLimit = BigInt(300000); // 適切なガスリミットを設定

        // メタデータのURLを0x${string}型に変換
        const hexMetadata = `0x${Buffer.from(metadataUrl).toString('hex')}` as `0x${string}`;

        // NFTのミント
        const mintTransaction = prepareContractCall({
          contract,
          method: 'mint',
          params: [
            selectedWalletAddress, // to: 受信者のアドレス
            tokenId, // tokenId: トークンID
            BigInt(1), // amount: ミントする数量
            hexMetadata, // data: メタデータのURLを0x${string}型で渡す
          ],
        });

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
              const txData =
                typeof tx.data === 'function'
                  ? await (tx.data as () => Promise<string>)()
                  : tx.data;

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
              const txData =
                typeof tx.data === 'function'
                  ? await (tx.data as () => Promise<string>)()
                  : tx.data;

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
          transaction: mintTransaction,
        });

        console.log('トランザクション成功！ハッシュ:', transactionHash);
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

        console.log(`NFTの作成中にエラーが発生しました: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    } catch (error: unknown) {
      console.error('エラーが発生しました:', error);

      // ユーザーがトランザクションを拒否した場合
      if (isWalletError(error) && error.code === 4001) {
        console.log(
          'トランザクションがキャンセルされました。\n※画像とメタデータはIPFSにアップロード済みです。',
        );
      } else {
        console.log(
          'NFTの作成中にエラーが発生しました。もう一度お試しください。\n※画像とメタデータはIPFSにアップロード済みです。',
        );
      }
    }
  };

  return (
    <div className="pt-14 max-w-md mx-auto px-4 space-y-4">
      <FileUpload preview={preview} onFileSelect={handleFileSelect} />
      <WalletSelector />
      <CreateButton
        disabled={!selectedFile || !selectedWalletAddress}
        onClick={handleCreate}
        loading={loading}
      />
    </div>
  );
}
