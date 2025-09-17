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
  async rewrites() {
    return [
      {
        source: '/api/proxy/privy-farcaster/:path*',
        destination: 'https://privy.farcaster.xyz/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/api/proxy/privy-farcaster/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);
