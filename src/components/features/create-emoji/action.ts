'use server';

import { EMOJI_CONTRACT_ADDRESS } from '@/lib/thirdweb';
import { Sepolia } from '@thirdweb-dev/chains';
import { ThirdwebSDK } from '@thirdweb-dev/sdk';

// NFTをミントする関数
export async function mintEmojiNFT({
  toAddress,
  supply,
  metadata,
}: {
  toAddress: string;
  supply: bigint;
  metadata: {
    name: string;
    description: string;
    image: string;
  };
}) {
  try {
    if (!process.env.THIRDWEB_SECRET_KEY) {
      throw new Error('THIRDWEB_SECRET_KEY is not defined');
    }

    // SDKの初期化
    const sdk = new ThirdwebSDK(Sepolia, {
      secretKey: process.env.THIRDWEB_SECRET_KEY,
    });

    // コントラクトの取得
    const contract = await sdk.getContract(EMOJI_CONTRACT_ADDRESS);

    // NFTのミント
    const result = await contract.erc1155.mintTo(toAddress, {
      metadata,
      supply: supply.toString(),
    });

    const receipt = result.receipt;
    console.log(
      'NFTがミントされました。トランザクションハッシュ:',
      receipt.transactionHash,
    );

    return {
      success: true,
      transactionHash: receipt.transactionHash,
    };
  } catch (error) {
    console.error('NFTのミントに失敗しました:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
