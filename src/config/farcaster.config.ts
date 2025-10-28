export interface FarcasterConfig {
  accountAssociation: {
    header: string;
    payload: string;
    signature: string;
  };
  miniapp: {
    version: string;
    name: string;
    homeUrl: string;
    iconUrl: string;
    splashImageUrl: string;
    splashBackgroundColor: string;
    subtitle: string;
    description: string;
    primaryCategory: string;
    tags: string[];
    heroImageUrl: string;
    tagline: string;
    ogTitle: string;
    ogDescription: string;
    ogImageUrl: string;
    buttonTitle?: string;
    noindex: boolean;
  };
  baseBuilder: {
    ownerAddress: string;
  };
}

export const developmentConfig: FarcasterConfig = {
  accountAssociation: {
    header:
      'eyJmaWQiOjI0NTI2MywidHlwZSI6ImF1dGgiLCJrZXkiOiIweDQ5RmY2QTQxMDU5ZTc3NENmMTlhRTEzNDZDMkZkQjAwYmE5OUFmZDQifQ',
    payload: 'eyJkb21haW4iOiJlbW9qaWZ5LWRldmVsb3AudmVyY2VsLmFwcCJ9',
    signature:
      'eLmEuihY57WPYkLtLOUsUItLXrYZ2/raJ73xXDskN3ZoIMS2H25H5z4oHetbOkJPqMxtrjdQ6DQ9ScsClaGajRw=',
  },
  miniapp: {
    version: '1',
    name: 'Emojify',
    homeUrl: 'https://emojify-develop.vercel.app',
    iconUrl: 'https://emojify-develop.vercel.app/icons/icon-512x512.png',
    splashImageUrl: 'https://emojify-develop.vercel.app/icons/icon-512x512.png',
    splashBackgroundColor: '#FFFFFF',
    subtitle: 'No Words, Just Emojis',
    description: 'Emoji-only chat app',
    primaryCategory: 'social',
    tags: ['social', 'chat', 'nft', 'emoji'],
    heroImageUrl: 'https://emojify-develop.vercel.app/icons/icon-512x512.png',
    tagline: 'No Words, Just Emojis',
    ogTitle: 'No Words, Just Emojis',
    ogDescription: 'Emoji-only chat app',
    ogImageUrl: 'https://emojify-develop.vercel.app/icons/icon-512x512.png',
    noindex: false,
  },
  baseBuilder: {
    ownerAddress: '0x184611C6337FAf3A9e823b554930c1B69A4026b9',
  },
};

export const productionConfig: FarcasterConfig = {
  accountAssociation: {
    header:
      'eyJmaWQiOjI0NTI2MywidHlwZSI6ImF1dGgiLCJrZXkiOiIweDQ5RmY2QTQxMDU5ZTc3NENmMTlhRTEzNDZDMkZkQjAwYmE5OUFmZDQifQ',
    payload: 'eyJkb21haW4iOiJlbW9qaWZ5LmNsdWIifQ',
    signature:
      'pugy8pCdprJ/+WMk4ahkj2D16eJXj8JuGqi3ipULhJcb5xGj8JgVbpMwzGELtJ7pBioqbmzNGLCBCkvWkfMU1hs=',
  },
  miniapp: {
    version: '1',
    name: 'Emojify',
    homeUrl: 'https://emojify.club/',
    iconUrl: 'https://emojify.club/icons/icon-512x512.png',
    splashImageUrl: 'https://emojify.club/icons/icon-512x512.png',
    splashBackgroundColor: '#FFFFFF',
    subtitle: 'No Words, Just Emojis',
    description: 'Emoji-only chat app',
    primaryCategory: 'social',
    tags: ['social', 'chat', 'nft', 'emoji'],
    heroImageUrl: 'https://emojify.club/icons/icon-512x512.png',
    tagline: 'No Words, Just Emojis',
    ogTitle: 'No Words, Just Emojis',
    ogDescription: 'Emoji-only chat app',
    ogImageUrl: 'https://emojify.club/icons/icon-512x512.png',
    buttonTitle: 'Open',
    noindex: false,
  },
  baseBuilder: {
    ownerAddress: '0x184611C6337FAf3A9e823b554930c1B69A4026b9',
  },
};

export function getFarcasterConfig(): FarcasterConfig {
  const environment = process.env.NEXT_PUBLIC_ENVIRONMENT || 'development';
  return environment === 'production' ? productionConfig : developmentConfig;
}
