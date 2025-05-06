export interface NFTData {
  tokenId: string;
  name: string;
  imageUrl: string;
  creator?: {
    id: string;
    username: string;
  };
  details?: {
    token: string;
    network: string;
  };
}

// EmojiItemDataはNFTDataと同じ型を使用
export type EmojiItemData = NFTData;
