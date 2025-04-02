export interface CreatorData {
  id: string;
  username: string;
  avatar: string;
  timeAgo: string;
}

export interface DetailsData {
  firstCollector: string;
  firstCollectorAvatar: string;
  token: string;
  network: string;
}

export interface EmojiData {
  id: string;
  image: string;
  creator: CreatorData;
  details: DetailsData;
}
