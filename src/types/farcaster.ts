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
  version: '1';
  imageUrl: string;
  button: {
    title: string;
    action: {
      type: 'launch_mini_app';
      url: string;
    };
  };
}

export interface FarcasterMiniAppContext {
  user: {
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
    bio?: string;
    location?: {
      placeId: string;
      description: string;
    };
  };
  client: {
    platformType?: 'web' | 'mobile';
    clientFid: number;
    added: boolean;
    safeAreaInsets?: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
  };
  features?: {
    haptics: boolean;
    cameraAndMicrophoneAccess?: boolean;
  };
}

export interface FarcasterAuthState {
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  error: string | null;
  userContext: FarcasterMiniAppContext['user'] | null;
  isInFarcasterApp: boolean;
}
