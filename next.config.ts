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
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' http://localhost:3000 https://emoji-chat.netlify.app https://www.emoji-chat.netlify.app https://auth.privy.io"
          }
        ]
      }
    ]
  }
};

export default withPWA(nextConfig);
