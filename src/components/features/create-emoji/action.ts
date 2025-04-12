'use server';

import { EMOJI_CONTRACT_ADDRESS, getSDK } from '@/lib/thirdweb';

type UploadResult = {
  success: boolean;
  uri?: string;
  error?: string;
};

// IPFSにファイルをアップロードする関数
export async function uploadToIPFS(formData: FormData): Promise<UploadResult> {
  try {
    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      throw new Error('ファイルが見つかりません');
    }

    const sdk = getSDK();
    const uri = await sdk.storage.upload(file, {
      uploadWithGatewayUrl: true
    });

    if (!uri) {
      throw new Error('アップロードに失敗しました: URIが取得できません');
    }

    return {
      success: true,
      uri: uri,
    };
  } catch (error) {
    console.error('IPFSへのアップロードに失敗しました:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

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
    const sdk = getSDK();
    
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
