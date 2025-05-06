export interface CreatorData {
  id: string;
  username: string;
}

export interface DetailsData {
  token: string;
  network: string;
}

export interface EmojiData {
  id: string;
  name: string;
  image: string;
  creator: CreatorData;
  details: DetailsData;
}
