import { CLIENT_ID } from '@/lib/thirdweb';
import { ThirdwebStorage } from '@thirdweb-dev/storage';

// ThirdwebStorageインスタンスの初期化
const storage = new ThirdwebStorage({
  clientId: CLIENT_ID,
});

export const useIPFS = () => {
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

  // メタデータをIPFSにアップロード
  const uploadMetadataToIPFS = async (imageUrl: string, creatorAddress: string) => {
    const tokenId = BigInt(1);
    const metadata = {
      name: '',
      description: '',
      image: imageUrl,
      attributes: [
        {
          trait_type: 'creator',
          value: creatorAddress,
        },
      ],
    };

    const metadataUrl = await storage.upload(metadata);
    return metadataUrl;
  };

  return {
    uploadToIPFS,
    ipfsToHttp,
    uploadMetadataToIPFS,
  };
};
