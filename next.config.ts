import withPWAInit from '@ducanh2912/next-pwa';
import type { NextConfig } from 'next';

const withPWA = withPWAInit({
  dest: 'public',
  disable: false,
  register: true,
  // @ts-expect-error - runtimeCachingの型エラーを無視
  runtimeCaching: [
    {
      urlPattern: '/',
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'start-url',
      },
    },
    {
      urlPattern: /.*/i,
      handler: 'NetworkOnly',
      options: {
        cacheName: 'dev',
      },
    },
  ],
  workboxOptions: {
    // ログを無効化
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  devIndicators: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://farcaster.xyz https://wallet.farcaster.xyz",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://explorer-api.walletconnect.com https://client.warpcast.com https://farcaster.xyz https://wallet.farcaster.xyz https://*.privy.io https://*.firebase.com",
              "frame-src 'self' https://farcaster.xyz https://wallet.farcaster.xyz",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self' https://farcaster.xyz https://wallet.farcaster.xyz"
            ].join('; ')
          },
          {
            key: 'X-Frame-Options',
            value: 'ALLOW-FROM https://farcaster.xyz'
          }
        ],
      },
    ];
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.io',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: 'cloudflare-ipfs.com',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
        pathname: '/ipfs/**',
      },
    ],
  },
};

export default withPWA(nextConfig);
