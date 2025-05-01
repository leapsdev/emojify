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
    remotePatterns: [
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
