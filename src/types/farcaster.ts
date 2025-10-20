/**
 * Farcaster関連の型定義
 */

export interface FarcasterUser {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  profile: {
    bio: {
      text: string;
    };
  };
  follower_count: number;
  following_count: number;
  verifications: string[];
  verified_addresses: {
    eth_addresses: string[];
    sol_addresses: string[];
  };
}

export interface FarcasterContext {
  user?: {
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
  };
  cast?: {
    hash: string;
    fid: number;
  };
  location?: 'cast' | 'composer' | 'notification';
}

export interface MiniAppEmbed {
  version: '1' | 'next';
  imageUrl: string;
  button: {
    title: string;
    action: {
      type: 'launch_miniapp';
      name: string;
      url: string;
      splashImageUrl?: string;
      splashBackgroundColor?: string;
    };
  };
}
