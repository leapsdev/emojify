'use server'

import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { baseSepolia, EMOJI_CONTRACT_ADDRESS } from "@/lib/thirdweb";

// NFTをミントする関数
export async function mintEmojiNFT({
  toAddress,
  tokenId,
  supply,
  metadata
}: {
  toAddress: string;
  tokenId: bigint;
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
    const sdk = ThirdwebSDK.fromPrivateKey(
      process.env.THIRDWEB_SECRET_KEY,
      baseSepolia,
      {
        secretKey: process.env.THIRDWEB_SECRET_KEY,
      }
    );

    // コントラクトの取得
    const contract = await sdk.getContract(EMOJI_CONTRACT_ADDRESS);

    // NFTのミント
    const transaction = await contract.erc1155.mint({
      to: toAddress,
      tokenId: tokenId.toString(),
      amount: supply.toString(),
      metadata: metadata,
    });

    console.log("NFTがミントされました。トランザクションハッシュ:", transaction.hash);
    
    return {
      success: true,
      transactionHash: transaction.hash,
    };
  } catch (error) {
    console.error("NFTのミントに失敗しました:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
