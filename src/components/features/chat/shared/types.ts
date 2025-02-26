export type Message = {
  id: string;
  username: string;
  avatar: string;
  message: string;
  time: string;
  online: boolean;
};

export type ChatMessage = {
  id: string;
  content: string;
  timestamp: string;
  sent: boolean;
};

export type User = {
  id: string;
  name: string;
  username: string;
  avatar: string;
};

export interface SearchFriendsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface WalletModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
