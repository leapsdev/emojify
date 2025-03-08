import withPWAInit from '@ducanh2912/next-pwa';
import type { NextConfig } from 'next';

const withPWA = withPWAInit({
  dest: 'public',
  disable: true,
  register: true,
  // @ts-expect-error - runtimeCachingの型エラーを無視
  runtimeCaching: [
    {
      urlPattern: '/',
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'start-url'
      }
    },
    {
      urlPattern: /.*/i,
      handler: 'NetworkOnly',
      options: {
        cacheName: 'dev'
      }
    }
  ]
});

const nextConfig: NextConfig = {
  devIndicators: false,
};

export default withPWA(nextConfig);