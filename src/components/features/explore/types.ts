export interface EmojiItemData {
  id: string;
  image: string;
  name?: string;
  creator: {
    id: string;
    avatar: string;
  };
}
